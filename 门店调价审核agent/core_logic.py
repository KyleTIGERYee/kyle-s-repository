import json
from datetime import datetime, timedelta

def main(parsed_data: str, building_result: str, village_result: str, decoration_result: str, cost_result: str) -> dict:
    """
    核心审核逻辑：解析MCP数据 + 执行决策树
    
    输入：
    - parsed_data: 调价申请结构化数据
    - building_result: MCP返回的楼栋房源数据 ← de_定价agent数据集
    - village_result: MCP返回的同村房源数据 ← de_定价agent数据集
    - decoration_result: MCP返回的装修分类数据 ← 精装简装楼栋分类
    - cost_result: MCP返回的楼栋应付金额数据 ← 应收明细表
    
    输出：
    - all_passed: 是否全部通过
    - summary: 审核摘要文本
    - detail_json: 详细结果JSON
    - debug_table: 供调试使用的Markdown详细表格
    """
    
    # ============ 1. 解析输入数据 ============
    申请 = json.loads(parsed_data)
    调价房间列表 = 申请.get('rooms', [])
    楼栋名 = 申请.get('building', '')
    村名 = 申请.get('village', '')
    门店名 = 申请.get('store', '')
    
    # 解析MCP返回数据
    楼栋房源 = parse_mcp_result(building_result)
    全村房源 = parse_mcp_result(village_result)
    
    # 健壮性检查：检查是否连错数据集了
    if 楼栋房源 and '房间号' not in 楼栋房源[0]:
        return {
            "all_passed": False,
            "summary": "❌ 错误：`building_result` 传入的数据格式不正确（缺少'房间号'）。请检查 Dify 工作流中该变量是否误连到了'成本查询'节点。",
            "detail_json": "[]"
        }
    
    # 解析装修分类表，构建映射：{楼栋名: 装修类型}
    装修分类列表 = parse_mcp_result(decoration_result)
    装修映射 = {str(d.get('楼栋', '')): str(d.get('装修类型', '简装')) for d in 装修分类列表}
    
    # 为每个房间补充装修类型字段
    for room in 楼栋房源:
        room['装修类型'] = 装修映射.get(str(room.get('楼栋', '')), '简装')
    for room in 全村房源:
        room['装修类型'] = 装修映射.get(str(room.get('楼栋', '')), '简装')
    
    # ============ 2. 前置检查：楼栋成本溢价率 ============
    # 成本溢价率 = 调整后定价总价 / 应付金额
    
    # 解析应收明细表，获取该楼栋的应付金额
    成本列表 = parse_mcp_result(cost_result)
    应付金额 = sum(safe_float(c.get('应付金额', 0)) for c in 成本列表)
    
    # 计算调整后总定价
    调价映射 = {r['room_no']: float(r['adjusted_price']) for r in 调价房间列表}
    总定价 = 0.0
    for room in 楼栋房源:
        房间号 = str(room.get('房间号', ''))
        if 房间号 in 调价映射:
            总定价 += 调价映射[房间号]
        else:
            总定价 += safe_float(room.get('定价', 0))
    
    成本溢价率 = (总定价 / 应付金额 * 100) if 应付金额 > 0 else 0.0
    成本检查通过 = 成本溢价率 >= 100
    
    # ============ 3. 逐条审核 ============
    审核结果列表 = []
    通过数 = 0
    不通过数 = 0
    调增数 = 0
    
    for 调价项 in 调价房间列表:
        房间号 = str(调价项['room_no'])
        调整后价格 = float(调价项['adjusted_price'])
        
        # 在MCP数据中找到该房间
        房间数据 = None
        for r in 楼栋房源:
            if str(r.get('房间号', '')) == 房间号:
                房间数据 = r
                break
        
        if not 房间数据:
            审核结果列表.append({
                'room_no': 房间号,
                'passed': False,
                'reason': f'房间号{房间号}在系统中未找到，请核实',
                'current_price': 0,
                'adjusted_price': 调整后价格
            })
            不通过数 += 1
            continue
        
        当前价格 = safe_float(房间数据.get('定价', 0))
        
        # 判断调增/调减
        if 调整后价格 >= 当前价格:
            审核结果列表.append({
                'room_no': 房间号,
                'passed': True,
                'rule_id': 'P1',
                'reason': '调增，自动通过',
                'current_price': 当前价格,
                'adjusted_price': 调整后价格
            })
            通过数 += 1
            调增数 += 1
            continue
        
        # 调减 → 先检查成本溢价率
        if not 成本检查通过:
            审核结果列表.append({
                'room_no': 房间号,
                'passed': False,
                'rule_id': 'P2',
                'reason': f'楼栋成本溢价率{成本溢价率:.1f}%（总定价{总定价:.0f}元 / 应付金额{应付金额:.0f}元），低于100%，不允许调价',
                'current_price': 当前价格,
                'adjusted_price': 调整后价格
            })
            不通过数 += 1
            continue
        
        # 进入决策树
        result = 执行决策树(房间数据, 楼栋房源, 全村房源, 调整后价格, 当前价格, 调价映射)
        
        # 决策树通过后，追加杠杆规则校验
        if result['passed']:
            杠杆结果 = 杠杆规则校验(楼栋房源, 调价映射)
            杠杆不通过 = [r for r in 杠杆结果 if r['room_no'] == 房间号 and not r['passed']]
            if 杠杆不通过:
                result = {
                    'passed': False,
                    'rule_id': 'Lever',
                    'reason': 杠杆不通过[0]['reason'],
                    'metrics': result.get('metrics', {}),
                    'calc_logs': result.get('calc_logs', [])
                }
        
        审核结果列表.append({
            'room_no': 房间号,
            'passed': result['passed'],
            'rule_id': result.get('rule_id', 'UNKNOWN'),
            'reason': result['reason'],
            'current_price': 当前价格,
            'adjusted_price': 调整后价格,
            'metrics': result.get('metrics', {}),
            'calc_logs': result.get('calc_logs', [])
        })
        if result['passed']:
            通过数 += 1
        else:
            不通过数 += 1
    
    # ============ 4. 生成结论 (严格匹配 PRD 7.2 格式) ============
    全部通过 = (不通过数 == 0)
    
    if 全部通过:
        summary = f"✅ 审核结果：全部通过\n\n"
        summary += f"📋 审核概要：\n"
        summary += f"- 楼栋：{楼栋名}\n- 村：{村名}\n- 调价房间数：{len(调价房间列表)} 间\n"
        summary += f"- 调增：{调增数} 间（自动通过）\n"
        summary += f"- 调减审核通过：{通过数 - 调增数} 间\n"
        summary += f"- 楼栋成本溢价率：{成本溢价率:.1f}%（达标）\n\n"
        summary += f"📧 已自动发送审核通过邮件至审核负责人，Excel文件已作为附件存档。"
    else:
        summary = f"⚠️ 审核结果：存在不通过项\n\n"
        summary += f"📋 审核概要：\n"
        summary += f"- 楼栋：{楼栋名}\n- 调价房间数：{len(调价房间列表)} 间\n"
        summary += f"- 通过：{通过数} 间\n- 不通过：{不通过数} 间\n\n"
        summary += f"❌ 不通过明细：\n\n"
        summary += f"| 序号 | 房间号 | 当前定价 | 调整后价格 | 调价幅度 | 不通过原因 |\n"
        summary += f"| :--- | :--- | :--- | :--- | :--- | :--- |\n"
        
        idx = 1
        for r in 审核结果列表:
            if not r['passed']:
                gap_val = (r['adjusted_price'] - r['current_price']) / r['current_price'] if r['current_price'] > 0 else 0
                gap_pct = f"{gap_val*100:.1f}%"
                summary += f"| {idx} | {r['room_no']} | {r['current_price']:.0f} | {r['adjusted_price']:.0f} | {gap_pct} | {r['reason']} |\n"
                idx += 1
        
        summary += f"\n💡 建议：请调整以上房间的价格后重新提交。"
    
    # ============ 5. 生成 Debug Markdown 报告 ============
    debug_table = "### 🛠️ 审核调试详细数据表\n\n"
    debug_table += "| 房间号 | 结果 | 规则ID | 空置 | 楼栋入住 | 村入住 | 成交 | 调价差距 | 均价A | 调整后均价 | 红线底价 | 拒绝/通过原因 |\n"
    debug_table += "|---|---|---|---|---|---|---|---|---|---|---|---|\n"
    
    details_section = "\n\n### 🔍 房间详细推演过程\n\n"
    
    for r in 审核结果列表:
        m = r.get('metrics', {})
        passed_str = "✅ 通过" if r.get('passed') else "❌ 拒绝"
        rule_id = r.get('rule_id', '-')
        reason = str(r.get('reason', '')).replace('|', '｜')
        
        if rule_id in ['P1', 'P2', 'Lever'] or rule_id == '-':
            debug_table += f"| {r.get('room_no')} | {passed_str} | {rule_id} | - | - | - | - | - | - | - | - | {reason} |\n"
        else:
            debug_table += f"| {r.get('room_no')} | {passed_str} | {rule_id} | {m.get('空置','-')} | {m.get('楼栋入','-')} | {m.get('村入','-')} | {m.get('近7天','-')} | {m.get('调价差距','-')} | {m.get('均价A','-')} | {m.get('调整后均价','-')} | {m.get('红线底价','-')} | {reason} |\n"

        details_section += f"#### 🏠 房间 {r.get('room_no')} 推演详情\n\n"
        if rule_id == 'P1':
            details_section += "- **前置规则判断**: 调整后价格大于等于当前价格，无需进入决策树，自动通过。\n"
        elif rule_id == 'P2':
            details_section += f"- **成本前置校验**: 楼栋总定价 {总定价:.0f} / 应付金额 {应付金额:.0f} = 成本溢价率 {成本溢价率:.1f}%。低于100%，触发一票否决。\n"
        else:
            calc_logs = r.get('calc_logs', [])
            if calc_logs:
                details_section += "\n".join(calc_logs) + "\n"
            if rule_id == 'Lever':
                details_section += f"- ⚠️ **杠杆规则拒绝拦截**: 决策树原本通过，但触发杠杆规则：{r.get('reason')}\n"
        details_section += "\n---\n\n"

    debug_table += details_section
    return {
        "all_passed": 全部通过,
        "summary": summary,
        "detail_json": json.dumps(审核结果列表, ensure_ascii=False),
        "debug_table": debug_table
    }


# ============ 辅助函数 ============

def parse_mcp_result(result_str):
    """解析MCP query_local_data返回的数据为字典列表"""
    try:
        data = json.loads(result_str)
        columns = data.get('columns', [])
        rows = data.get('rows', [])
        return [dict(zip(columns, row)) for row in rows]
    except:
        return []

def safe_float(val):
    """安全转换为浮点数"""
    try:
        return float(val) if val else 0.0
    except:
        return 0.0

def safe_int(val):
    """安全转换为整数"""
    try:
        return int(float(val)) if val else 0
    except:
        return 0

def parse_date(date_str):
    """解析日期字符串，兼容多种格式"""
    if not date_str:
        return None
    try:
        s = str(date_str).strip()
        # 尝试解析为纯数字时间戳（毫秒或秒）
        try:
            num = float(s)
            if num > 1e12:  # 毫秒级时间戳
                return datetime.fromtimestamp(num / 1000)
            elif num > 1e9:  # 秒级时间戳
                return datetime.fromtimestamp(num)
        except ValueError:
            pass
        # 去掉毫秒部分
        if '.' in s and s[0].isdigit():
            s = s.split('.')[0]
        # 去掉时区后缀
        if s.endswith('Z'):
            s = s[:-1]
        if '+' in s and s[0].isdigit() and s.count('+') == 1:
            s = s.split('+')[0]
        # 替换中文日期格式
        s = s.replace('年', '-').replace('月', '-').replace('日', ' ')
        # 替换T分隔
        s = s.replace('T', ' ')
        # 清理多余空格
        s = ' '.join(s.split())
        for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%Y-%m-%d', '%Y/%m/%d %H:%M:%S', '%Y/%m/%d %H:%M', '%Y/%m/%d']:
            try:
                return datetime.strptime(s, fmt)
            except ValueError:
                continue
        return None
    except:
        return None

def classify_room_type(room):
    """
    根据房型分类标准，生成房型编码
    
    开间/一居室：6维度组合（电梯+楼层+面积+阳台+采光+精装简装）
    其他格局（二人宿舍等）：直接用格局名称
    """
    格局 = str(room.get('户型', '')).strip()
    
    # 宿舍和多居室直接按格局分类
    if 格局 in ['二人宿舍', '四人宿舍', '六人宿舍', '二居室', '三居室', '轻复式']:
        return 格局
    
    if 格局 not in ['开间', '一居室']:
        return 格局  # 兜底
    
    楼层 = safe_int(room.get('楼层', 1))
    电梯值 = str(room.get('是否电梯房', '否')).strip() == '是'
    面积 = safe_float(room.get('面积', 15))
    阳台 = str(room.get('阳台', '无')).strip()
    采光 = safe_int(room.get('采光系数', 3))
    装修 = str(room.get('装修类型', '简装')).strip()
    
    # 电梯分档（1层不考虑电梯）
    电梯档 = '无' if 楼层 == 1 else ('有' if 电梯值 else '无')
    
    # 楼层分档
    if 楼层 == 1:
        楼层档 = '1层'
    elif 楼层 <= 5:
        楼层档 = '2-5层'
    elif 楼层 <= 8:
        楼层档 = '6-8层'
    else:
        楼层档 = '9层以上'
    
    # 面积分档
    if 格局 == '开间':
        面积档 = '<13' if 面积 < 13 else ('13-20' if 面积 <= 20 else '>20')
    else:
        面积档 = '<23' if 面积 < 23 else ('23-28' if 面积 <= 28 else '>28')
    
    # 阳台分档
    阳台档 = '有阳台' if 阳台 in ['有', '是', '1'] else '无阳台'
    
    # 采光分档
    采光档 = '采光1-2' if 采光 <= 2 else '采光3-5'
    
    return f"{格局}_{电梯档}_{楼层档}_{面积档}_{阳台档}_{采光档}_{装修}"


def 执行决策树(房间数据, 楼栋房源, 全村房源, 调整后价格, 当前价格, 调价映射):
    """
    核心决策树逻辑：按最新分类规则执行，加入详细的 Rule ID 和调试指标以及完整的计算过程日志
    """
    # === 1. 构建指标 ===
    today = datetime.now()
    是否已租 = str(房间数据.get('是否已租', '否')).strip() == '是'
    
    calc_logs = []
    
    if 是否已租:
        空置天数 = 0
        calc_logs.append("- **空置天数**: 房间当前状态为 [已租]，默认空置 < 30天。")
    else:
        最后出租时间_str = 房间数据.get('最后出租时间', '')
        最后出租时间 = parse_date(最后出租时间_str)
        空置天数 = (today - 最后出租时间).days if 最后出租时间 else 0
        if 最后出租时间:
            calc_logs.append(f"- **空置天数**: 最后出租时间为 [{最后出租时间_str}]，距今计算为 {空置天数} 天。")
        else:
            calc_logs.append(f"- **空置天数**: 无法解析最后出租时间 [{最后出租时间_str}]，保守记为 0 天。")
    
    目标资产户型 = str(房间数据.get('资产户型', ''))
    同户型房源 = [r for r in 楼栋房源 if str(r.get('资产户型', '')) == 目标资产户型]
    同户型总数 = len(同户型房源)
    同户型已租数 = sum(1 for r in 同户型房源 if str(r.get('是否已租', '否')).strip() == '是')
    楼栋入住率 = 同户型已租数 / 同户型总数 if 同户型总数 > 0 else 0
    calc_logs.append(f"- **楼栋入住率**: 提取资产户型为 [{目标资产户型}]。找到同楼栋同户型共 {同户型总数} 套，已租 {同户型已租数} 套，楼栋入住率 = {同户型已租数}/{同户型总数} = {楼栋入住率*100:.1f}%。")
    
    目标房型 = classify_room_type(房间数据)
    同房型房源 = [r for r in 全村房源 if classify_room_type(r) == 目标房型]
    同房型总数 = len(同房型房源)
    同房型已租数 = sum(1 for r in 同房型房源 if str(r.get('是否已租', '否')).strip() == '是')
    村入住率 = 同房型已租数 / 同房型总数 if 同房型总数 > 0 else 0
    calc_logs.append(f"- **村入住率**: 组合房型分类为 [{目标房型}]。找到同村同房型共 {同房型总数} 套，已租 {同房型已租数} 套，村入住率 = {同房型已租数}/{同房型总数} = {村入住率*100:.1f}%。")
    
    七天前 = today - timedelta(days=7)
    近7天成交 = 0
    for r in 同房型房源:
        成交dt = parse_date(r.get('成交时间', ''))
        if 成交dt and 成交dt >= 七天前:
            近7天成交 += 1
    calc_logs.append(f"- **近7天成交**: 统计同村同房型且成交日期在 [{七天前.strftime('%Y-%m-%d')}] 之后的房源，共查得 {近7天成交} 套成交记录。")
    
    调价差距 = abs(调整后价格 - 当前价格) / 当前价格 * 100 if 当前价格 > 0 else 0
    调价幅度 = (调整后价格 - 当前价格) / 当前价格 if 当前价格 > 0 else 0
    calc_logs.append(f"- **调价差距**: 原价 {当前价格}，调整后价格 {调整后价格}，调价降幅百分比为 {调价差距:.1f}%。")
    
    同房型定价 = [safe_float(r.get('定价', 0)) for r in 同房型房源 if safe_float(r.get('定价', 0)) > 0]
    同房型定价数 = len(同房型定价)
    均价A = sum(同房型定价) / 同房型定价数 if 同房型定价数 > 0 else 当前价格
    调整后均价 = (均价A * 同房型定价数 - 当前价格 + 调整后价格) / 同房型定价数 if 同房型定价数 > 0 else 调整后价格
    calc_logs.append(f"- **均价计算**: 找到同村同房型具有合法定价的房源共 {同房型定价数} 套。当前均价A = {均价A:.2f}。用新价格替换该房源后重新计算均价，调整后均价 = {调整后均价:.2f}。")

    metrics = {
        "空置": f"{空置天数}天",
        "楼栋入": f"{楼栋入住率*100:.1f}%",
        "村入": f"{村入住率*100:.1f}%",
        "近7天": 近7天成交,
        "调价差距": f"{调价差距:.1f}%",
        "均价A": round(均价A, 2),
        "调整后均价": round(调整后均价, 2)
    }

    def decision(passed, rule_id, factor, reason):
        """统一封装返回结果，自动追加红线底价计算"""
        if factor is not None:
            metrics["底线因子"] = f"{factor*100:.0f}%"
            红线底价 = round(均价A * factor, 2)
            metrics["红线底价"] = 红线底价
            calc_logs.append(f"- **决策要求 (红线)**: 根据命中规则 [{rule_id}]，要求底线因子为 {factor*100}%，因此 红线底价 = {均价A:.2f} × {factor} = {红线底价:.2f}。")
        else:
            metrics["底线因子"] = "-"
            metrics["红线底价"] = "-"
            calc_logs.append(f"- **决策要求 (无红线)**: 命中规则 [{rule_id}]，此规则无红线均价底线要求。")
        
        calc_logs.append(f"➡️ **最终决策结论**: 判定为【{'通过' if passed else '拒绝'}】。原因：{reason}")
            
        return {'passed': passed, 'rule_id': rule_id, 'reason': f'[{rule_id}] {reason}', 'metrics': metrics, 'calc_logs': calc_logs}

    # === 2. 决策逻辑 ===
    if 空置天数 < 30:
        if 楼栋入住率 >= 0.90:
            if 村入住率 >= 0.90:
                if 调价差距 < 5:
                    return decision(False, 'R1', None, '双高入住率且降幅<5%，无需降价')
                else:
                    return decision(False, 'R2', None, '双高入住率，不建议降价')
            else:
                if 近7天成交 > 3:
                    return decision(False, 'R3', None, '近期成交活跃，不建议降价')
                if 调价差距 < 5:
                    if 调整后均价 >= 均价A * 0.95: return decision(True, 'R4', 0.95, '符合微降标准')
                    else: return decision(False, 'R5', 0.95, '降幅过大，低于均价95%')
                else:
                    return decision(False, 'R6', None, '降幅>5%，超出允许范围')
        else:
            if 村入住率 >= 0.90:
                return decision(False, 'R7', None, '村入住率≥90%，需求充足')
            if 近7天成交 > 3:
                return decision(False, 'R8', None, '近期成交活跃')
            if 调价差距 < 5:
                if 调整后均价 >= 均价A * 0.90: return decision(True, 'R9', 0.90, '符合微降标准')
                else: return decision(False, 'R10', 0.90, '降幅过大，低于均价90%')
            else:
                if 调整后均价 >= 均价A * 0.90: return decision(True, 'R11', 0.90, '符合降价标准')
                else: return decision(False, 'R12', 0.90, '降幅过大，低于均价90%')
                
    elif 空置天数 < 60:
        if 楼栋入住率 >= 0.90:
            if 村入住率 >= 0.90:
                if 近7天成交 > 3: return decision(False, 'R13', None, '村活跃度高，不建议降价')
                if 调价差距 < 5:
                    if 调整后均价 >= 均价A * 0.90: return decision(True, 'R14', 0.90, '符合微降标准')
                    else: return decision(False, 'R15', 0.90, '降幅过大')
                else: return decision(False, 'R16', None, '降幅>5%，超出允许范围')
            else:
                if 近7天成交 > 3:
                    if 调价差距 < 5:
                        if 调整后均价 >= 均价A * 0.90: return decision(True, 'R17', 0.90, '符合微降标准')
                        else: return decision(False, 'R18', 0.90, '降幅过大')
                    else: return decision(False, 'R19', None, '降幅>5%，超出允许范围')
                else:
                    if 调价差距 < 5:
                        if 调整后均价 >= 均价A * 0.88: return decision(True, 'R20', 0.88, '符合微降标准')
                        else: return decision(False, 'R21', 0.88, '降幅过大')
                    else:
                        if 调整后均价 >= 均价A * 0.88: return decision(True, 'R22', 0.88, '符合降价标准')
                        else: return decision(False, 'R23', 0.88, '降幅过大')
        else:
            if 村入住率 >= 0.90:
                if 近7天成交 > 3:
                    if 调价差距 < 5:
                        if 调整后均价 >= 均价A * 0.90: return decision(True, 'R24', 0.90, '符合微降标准')
                        else: return decision(False, 'R25', 0.90, '降幅过大')
                    else: return decision(False, 'R26', None, '降幅>5%，超出允许范围')
                else:
                    if 调价差距 < 5:
                        if 调整后均价 >= 均价A * 0.90: return decision(True, 'R27', 0.90, '符合微降标准')
                        else: return decision(False, 'R28', 0.90, '降幅过大')
                    else:
                        if 调整后均价 >= 均价A * 0.90: return decision(True, 'R29', 0.90, '符合降价标准')
                        else: return decision(False, 'R30', 0.90, '降幅过大')
            else:
                if 近7天成交 > 3:
                    if 调价幅度 < -0.05:
                        if 调整后均价 >= 均价A * 0.90: return decision(True, 'R31', 0.90, '符合降价标准')
                        else: return decision(False, 'R31-Reject', 0.90, '降幅过大')
                    else: return decision(False, 'R31-Gap', None, '调价差距不足，不允许降价')
                else:
                    if 调价幅度 < -0.10:
                        if 调整后均价 >= 均价A * 0.90: return decision(True, 'R32', 0.90, '符合降价标准')
                        else: return decision(False, 'R33', 0.90, '降幅过大')
                    else: return decision(False, 'R34', None, '调价差距不足(需<-10%)')

    elif 空置天数 < 90:
        if 楼栋入住率 >= 0.85:
            if 村入住率 > 0.85:
                if 近7天成交 > 3:
                    if 调价差距 < 10:
                        if 调整后均价 >= 均价A * 0.88: return decision(True, 'R35', 0.88, '符合标准')
                        else: return decision(False, 'R36', 0.88, '降幅过大')
                    else: return decision(False, 'R37', None, '降幅>10%，超出允许范围')
                else:
                    if 调价差距 < 10:
                        if 调整后均价 >= 均价A * 0.85: return decision(True, 'R38', 0.85, '符合标准')
                        else: return decision(False, 'R39', 0.85, '降幅过大')
                    else:
                        if 调整后均价 >= 均价A * 0.85: return decision(True, 'R40', 0.85, '符合标准')
                        else: return decision(False, 'R41', 0.85, '降幅过大')
        else:
            if 近7天成交 > 5:
                if 调价差距 < 10:
                    if 调整后均价 >= 均价A * 0.85: return decision(True, 'R42', 0.85, '符合标准')
                    else: return decision(False, 'R43', 0.85, '降幅过大')
                else:
                    if 调整后均价 >= 均价A * 0.85: return decision(True, 'R44', 0.85, '符合标准')
                    else: return decision(False, 'R45', 0.85, '降幅过大')
            else:
                if 调价差距 < 15:
                    if 调整后均价 >= 均价A * 0.85: return decision(True, 'R46', 0.85, '符合标准')
                    else: return decision(False, 'R47', 0.85, '降幅过大')
                else:
                    if 调整后均价 >= 均价A * 0.85: return decision(True, 'R48', 0.85, '符合标准')
                    else: return decision(False, 'R49', 0.85, '降幅过大')
    else:
        if 楼栋入住率 >= 0.85:
            if 村入住率 >= 0.80:
                if 近7天成交 > 5:
                    if 调价差距 < 15:
                        if 调整后均价 >= 均价A * 0.85: return decision(True, 'R50', 0.85, '符合标准')
                        else: return decision(False, 'R51', 0.85, '降幅过大')
                    else: return decision(False, 'R52', None, '降幅>15%，超出允许范围')
                else:
                    if 调价差距 < 15:
                        if 调整后均价 >= 均价A * 0.83: return decision(True, 'R53', 0.83, '符合标准')
                        else: return decision(False, 'R54', 0.83, '降幅过大')
                    else:
                        if 调整后均价 >= 均价A * 0.83: return decision(True, 'R55', 0.83, '符合标准')
                        else: return decision(False, 'R56', 0.83, '降幅过大')
        else:
            if 近7天成交 > 5:
                if 调价差距 < 15:
                    if 调整后均价 >= 均价A * 0.83: return decision(True, 'R57', 0.83, '符合标准')
                    else: return decision(False, 'R58', 0.83, '降幅过大')
                else: return decision(False, 'R58-Gap', None, '降幅>15%')
            else:
                if 调价差距 < 15:
                    if 调整后均价 >= 均价A * 0.83: return decision(True, 'R59', 0.83, '符合标准')
                    else: return decision(False, 'R60', 0.83, '降幅过大')
                else: return decision(False, 'R60-Gap', None, '降幅>15%')

    return decision(False, '规则外默认拦截', None, '当前场景参数组合不在PRD明确允许的规则集内，系统执行默认拒绝拦截')


def 杠杆规则校验(楼栋房源, 调价映射):
    """
    杠杆规则：楼层价格规律性校验
    在决策树审核通过后，对所有调价房间追加校验
    
    规则A：某层调整后价格 < 楼上 AND < 楼下 → 拒绝（价格异常偏低）
    规则B：某层调整后价格 > 楼上 AND > 楼下 → 限价在同户型最大最小值之间，超出则拒绝
    
    输入：
    - 楼栋房源: 该楼栋所有房间数据
    - 调价映射: {房间号: 调整后价格}
    
    输出：
    - results: [{room_no, passed, reason}, ...] 杠杆规则校验结果列表
    """
    results = []
    
    # 1. 获取调整后价格（已调价用新价，未调价用原价）
    def get_adjusted_price(room):
        房间号 = str(room.get('房间号', ''))
        if 房间号 in 调价映射:
            return 调价映射[房间号]
        return safe_float(room.get('定价', 0))
    
    # 2. 按资产户型分组
    户型分组 = {}
    for room in 楼栋房源:
        户型 = str(room.get('资产户型', ''))
        if 户型 not in 户型分组:
            户型分组[户型] = []
        户型分组[户型].append(room)
    
    # 3. 只检查有调价房间的户型组
    调价房间号集合 = set(调价映射.keys())
    
    for 户型, 房间列表 in 户型分组.items():
        # 检查该户型是否有调价房间
        has_adjusted = any(str(r.get('房间号', '')) in 调价房间号集合 for r in 房间列表)
        if not has_adjusted:
            continue
        
        # 按楼层分组，计算每层均价
        楼层均价 = {}
        for room in 房间列表:
            楼层 = safe_int(room.get('楼层', 1))
            调后价 = get_adjusted_price(room)
            if 楼层 not in 楼层均价:
                楼层均价[楼层] = []
            楼层均价[楼层].append(调后价)
        
        # 计算每层均价
        for 楼层 in 楼层均价:
            楼层均价[楼层] = sum(楼层均价[楼层]) / len(楼层均价[楼层])
        
        # 计算该户型所有调整后价格的最大最小值
        所有调整后价格 = [get_adjusted_price(r) for r in 房间列表 if get_adjusted_price(r) > 0]
        户型最大价 = max(所有调整后价格) if 所有调整后价格 else 0
        户型最小价 = min(所有调整后价格) if 所有调整后价格 else 0
        
        # 排序楼层
        楼层列表 = sorted(楼层均价.keys())
        
        # 4. 逐楼层检查
        for 楼层 in 楼层列表:
            当前层价 = 楼层均价[楼层]
            
            # 获取楼上楼下均价
            楼上价 = 楼层均价.get(楼层 + 1)  # None表示最高层
            楼下价 = 楼层均价.get(楼层 - 1)  # None表示1层
            
            # 获取该楼层该户型中涉及调价的房间
            该层调价房间 = [r for r in 房间列表 
                          if safe_int(r.get('楼层', 1)) == 楼层 
                          and str(r.get('房间号', '')) in 调价房间号集合]
            
            if not 该层调价房间:
                continue  # 该层无调价房间，跳过
            
            # 规则A：该层比楼上楼下都低 → 拒绝
            # 边界处理：1层只和楼上比，最高层只和楼下比
            if 楼上价 is not None and 楼下价 is not None:
                # 中间楼层：需同时低于上下
                if 当前层价 < 楼上价 and 当前层价 < 楼下价:
                    for r in 该层调价房间:
                        results.append({
                            'room_no': str(r.get('房间号', '')),
                            'passed': False,
                            'reason': f'杠杆规则：{楼层}层调整后价格低于上下楼层，价格异常偏低，不符合楼层价格规律'
                        })
                    continue
            elif 楼上价 is not None and 楼下价 is None:
                # 1层：只和楼上比
                if 当前层价 < 楼上价:
                    # 1层比2层低属于正常规律，不算异常
                    pass
            elif 楼上价 is None and 楼下价 is not None:
                # 最高层：只和楼下比
                if 当前层价 < 楼下价:
                    # 最高层比楼下低也属正常
                    pass
            
            # 规则B：该层比楼上楼下都高 → 限价在户型最大最小值之间
            if 楼上价 is not None and 楼下价 is not None:
                if 当前层价 > 楼上价 and 当前层价 > 楼下价:
                    # 检查是否超出户型最大最小值范围
                    if 当前层价 > 户型最大价 or 当前层价 < 户型最小价:
                        for r in 该层调价房间:
                            results.append({
                                'room_no': str(r.get('房间号', '')),
                                'passed': False,
                                'reason': f'杠杆规则：{楼层}层调整后价格高于上下楼层，超出同户型最大最小值范围'
                            })
                    # 若在最大最小值范围内，通过
                    continue
            elif 楼上价 is not None and 楼下价 is None:
                # 1层：比2层高不正常
                if 当前层价 > 楼上价:
                    if 当前层价 > 户型最大价 or 当前层价 < 户型最小价:
                        for r in 该层调价房间:
                            results.append({
                                'room_no': str(r.get('房间号', '')),
                                'passed': False,
                                'reason': f'杠杆规则：1层调整后价格高于楼上，超出同户型最大最小值范围'
                            })
            elif 楼上价 is None and 楼下价 is not None:
                # 最高层：比楼下高是正常的，不触发
                pass
    
    return results