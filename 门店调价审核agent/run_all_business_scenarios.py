import json
import sys
import copy
from core_logic import main

# 1. 基础数据底座
try:
    with open('/Users/kyle/Desktop/VIBECODING/PM/门店调价审核agent/chuangye_garden.json', 'r', encoding='utf-8') as f:
        village_result = json.load(f)
except Exception as e:
    print("无法读取真实村数据，请确保已通过 MCP 导出 /tmp/chuangye_garden.json")
    sys.exit(1)

cols = village_result['columns']
building_rows = [row for row in village_result['rows'] if row[cols.index('楼栋')] == '创业花园80栋']
building_result = {
    "columns": cols,
    "rows": building_rows
}

cost_result_template = {
    "columns": ["楼栋", "应付金额"],
    "rows": [["创业花园80栋", 156808.0]]
}

decoration_result = {
    "columns": ["楼栋", "装修类型"],
    "rows": [["创业花园80栋", "简装"]]
}

results_table = []

def run_test_case(tc_id, rule_desc, target_room_no, new_price, expected_rule, 
                  vacancy_days=0, b_occ=1.0, v_occ=1.0, sales=0, isolate_room=False, cost_override=None):
    
    test_village_result = copy.deepcopy(village_result)
    test_building_result = copy.deepcopy(building_result)
    test_cost_result = copy.deepcopy(cost_result_template)

    # 强制修改定价
    for row in test_village_result['rows']:
        if row[cols.index('房间号')] == str(target_room_no):
            row[cols.index('定价')] = 3000
    for row in test_building_result['rows']:
        if row[cols.index('房间号')] == str(target_room_no):
            row[cols.index('定价')] = 3000
    
    if cost_override is not None:
        test_cost_result['rows'][0][1] = cost_override
        
    # --- 核心 Mock 逻辑 ---
    # 找到目标房间的特征
    target_row_v = next((r for r in test_building_result['rows'] if str(r[cols.index('房间号')]) == str(target_room_no)), None)
    if not target_row_v: return
    
    asset_type = target_row_v[cols.index('资产户型')]
    room_type = target_row_v[cols.index('户型')]
    
    # 1. 空置天数 Mock
    from datetime import datetime, timedelta
    target_date = (datetime.now() - timedelta(days=vacancy_days)).strftime("%Y-%m-%d")
    target_row_v[cols.index('最后出租时间')] = target_date
    target_row_v[cols.index('是否已租')] = "否"
    
    # 找到 target 在 building_result 中的位置
    for r in test_building_result['rows']:
        if str(r[cols.index('房间号')]) == str(target_room_no):
            r[cols.index('最后出租时间')] = target_date
            r[cols.index('是否已租')] = "否"
            
    # 为了保证入住率计算准确，我们清理掉原本同房型/同户型的所有房间（除了target），并注入 100 个 fake 房间
    from core_logic import classify_room_type
    def to_dict(row):
        return {cols[i]: row[i] for i in range(len(cols))}
    
    target_class = classify_room_type(to_dict(target_row_v))
    
    # 清理并注入 test_building_result (同楼栋户型)
    test_building_result['rows'] = [r for r in test_building_result['rows'] if r[cols.index('资产户型')] != asset_type or str(r[cols.index('房间号')]) == str(target_room_no)]
    # 注入 100 个，包含 target 本身就是 101，所以再注入 99 个
    fake_b_rooms = []
    for i in range(99):
        fake = copy.deepcopy(target_row_v)
        fake[cols.index('房间号')] = f"fake_b_{i}"
        fake[cols.index('是否已租')] = "是" if i < int(99 * b_occ) else "否"
        fake[cols.index('定价')] = 3000
        fake_b_rooms.append(fake)
    test_building_result['rows'].extend(fake_b_rooms)

    # 清理并注入 test_village_result (同村同房型)
    test_village_result['rows'] = [r for r in test_village_result['rows'] if classify_room_type(to_dict(r)) != target_class or str(r[cols.index('房间号')]) == str(target_room_no)]
    fake_v_rooms = []
    for i in range(99):
        fake = copy.deepcopy(target_row_v)
        fake[cols.index('房间号')] = f"fake_v_{i}"
        # 对于村入住率，我们看 v_occ，但是需要注意 isolate_room
        fake[cols.index('是否已租')] = "是" if i < int(99 * v_occ) else "否"
        fake[cols.index('定价')] = 0 if isolate_room else 3000
        fake[cols.index('成交时间')] = ""
        fake_v_rooms.append(fake)
    
    # 4. 近7天成交 Mock
    recent_date = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
    for i in range(sales):
        if i < len(fake_v_rooms):
            fake_v_rooms[i][cols.index('成交时间')] = recent_date
            
    test_village_result['rows'].extend(fake_v_rooms)

    # --- 执行测试 ---
    parsed_data = {
        "store": "民治红山店",
        "village": "创业花园",
        "building": "创业花园80栋",
        "rooms": [{"room_no": target_room_no, "adjusted_price": new_price}]
    }
    
    result = main(
        json.dumps(parsed_data),
        json.dumps(test_building_result),
        json.dumps(test_village_result),
        json.dumps(decoration_result),
        json.dumps(test_cost_result)
    )
    
    detail_list = json.loads(result['detail_json'])
    actual_rule = detail_list[0].get('rule_id', '')
    passed = actual_rule == expected_rule or expected_rule in actual_rule
    status = "✅ PASS" if passed else "❌ FAIL"
    
    # 记录到 Markdown Table
    results_table.append(f"| {tc_id} | {rule_desc} | {expected_rule} | {actual_rule} | {status} |")
    print(f"{tc_id}: Expected {expected_rule}, Got {actual_rule} -> {status}")
    if not passed:
        print(f"  Reason: {detail_list[0].get('reason')}")
        print(f"  Metrics: {detail_list[0].get('metrics')}")
        print(f"  Logs: {detail_list[0].get('calc_logs')}")


if __name__ == '__main__':
    print("开始生成并执行 30 个核心自动化测试用例...\n")
    
    results_table.append("| 用例ID | 测试场景描述 | 预期命中规则 | 实际命中规则 | 测试结果 |")
    results_table.append("|---|---|---|---|---|")
    
    # 基准房间 801, 当前价格假设为 3000
    r = "802"
    base_p = 3000
    
    # ==========================
    # 1. 拦截层测试
    # ==========================
    run_test_case("TC-01", "P1: 调增无条件通过", r, base_p + 100, "P1")
    run_test_case("TC-02", "P2: 成本溢价率不足100%拦截", r, base_p - 100, "P2", cost_override=9999999.0)
    
    # 杠杆测试找一个中间楼层
    run_test_case("TC-03", "Lever: 破坏楼层价格规律(砸盘)", "803", 2000, "Lever", vacancy_days=100, isolate_room=True)
    
    # ==========================
    # 2. 空置 < 30天 测试群 (R1 - R12)
    # 严控期：降幅 < 5% 且 均价跌幅容忍极低
    # ==========================
    run_test_case("TC-04", "R1: 双高入住率(≥90%)且微降(<5%)", r, base_p * 0.98, "R1", vacancy_days=10, b_occ=0.95, v_occ=0.95)
    run_test_case("TC-05", "R2: 双高入住率且降幅大(≥5%)", r, base_p * 0.90, "R2", vacancy_days=10, b_occ=0.95, v_occ=0.95)
    run_test_case("TC-06", "R3: 单高入住+近期高成交(>3)", r, base_p * 0.98, "R3", vacancy_days=10, b_occ=0.95, v_occ=0.80, sales=4)
    run_test_case("TC-07", "R4: 单高入住+低成交+微降+均价过线(≥0.95A)", r, base_p * 0.96, "R4", vacancy_days=10, b_occ=0.95, v_occ=0.80, sales=1, isolate_room=True)
    run_test_case("TC-08", "R5: 单高入住+低成交+微降+破均价线(<0.95A)", r, base_p * 0.94, "R5", vacancy_days=10, b_occ=0.95, v_occ=0.80, sales=1, isolate_room=True)
    run_test_case("TC-09", "R6: 单高入住+降幅>5%拦截", r, base_p * 0.90, "R6", vacancy_days=10, b_occ=0.95, v_occ=0.80, sales=1)
    run_test_case("TC-10", "R7: 楼栋低入住+村高入住(≥90%)", r, base_p * 0.90, "R7", vacancy_days=10, b_occ=0.80, v_occ=0.95)
    run_test_case("TC-11", "R8: 双低入住但近期高成交", r, base_p * 0.90, "R8", vacancy_days=10, b_occ=0.80, v_occ=0.80, sales=4)
    run_test_case("TC-12", "R9: 双低+低成交+微降+均价过线(≥0.90A)", r, base_p * 0.96, "R9", vacancy_days=10, b_occ=0.80, v_occ=0.80, sales=1, isolate_room=True)
    
    # ==========================
    # 3. 空置 30~60天 测试群 (R13 - R34)
    # ==========================
    run_test_case("TC-13", "R13: 30-60天,双高入住+高成交拦截", r, base_p * 0.90, "R13", vacancy_days=45, b_occ=0.95, v_occ=0.95, sales=4)
    run_test_case("TC-14", "R14: 30-60天,双高+低成交+微降+过线0.9A", r, base_p * 0.96, "R14", vacancy_days=45, b_occ=0.95, v_occ=0.95, sales=1, isolate_room=True)
    run_test_case("TC-15", "R20: 30-60天,单高入住+低成交+降<5%+过线0.88A", r, base_p * 0.96, "R20", vacancy_days=45, b_occ=0.95, v_occ=0.80, sales=1, isolate_room=True)
    run_test_case("TC-16", "R23: 30-60天,单高入住+大降+破底线0.88A", r, base_p * 0.85, "R23", vacancy_days=45, b_occ=0.95, v_occ=0.80, sales=1, isolate_room=True)
    run_test_case("TC-17", "R31: 30-60天,双低+高成交+降幅达标+过线0.90A", r, base_p * 0.92, "R31", vacancy_days=45, b_occ=0.80, v_occ=0.80, sales=4, isolate_room=True)
    run_test_case("TC-18", "R33: 30-60天,双低+低成交+大降>10%+破底线0.90A", r, base_p * 0.85, "R33", vacancy_days=45, b_occ=0.80, v_occ=0.80, sales=1, isolate_room=True)

    # ==========================
    # 4. 空置 60~90天 测试群 (R35 - R49)
    # 放松阈值：村入住降至85%，成交量要求升至5套
    # ==========================
    run_test_case("TC-19", "R36: 60-90天,双高+高成交+破底线0.88A", r, base_p * 0.85, "R36", vacancy_days=70, b_occ=0.90, v_occ=0.90, sales=6, isolate_room=True)
    run_test_case("TC-20", "R42: 60-90天,双低+高成交+降<10%+过线0.85A", r, base_p * 0.92, "R42", vacancy_days=70, b_occ=0.80, v_occ=0.80, sales=6, isolate_room=True)
    run_test_case("TC-21", "R49: 60-90天,双低+低成交+大降>15%+破底线0.85A", r, base_p * 0.80, "R49", vacancy_days=70, b_occ=0.80, v_occ=0.80, sales=2, isolate_room=True)
    
    # ==========================
    # 5. 空置 ≥ 90天 测试群 (R50 - R60)
    # 极限甩卖区：村入住降至80%，最低红线容忍度 0.83
    # ==========================
    run_test_case("TC-22", "R53: >=90天,双高入住+低成交+降<15%+过线0.83A", r, base_p * 0.86, "R53", vacancy_days=100, b_occ=0.90, v_occ=0.90, sales=2, isolate_room=True)
    run_test_case("TC-23", "R54: >=90天,双高入住+低成交+破底线0.83A", r, base_p * 0.80, "R54", vacancy_days=100, b_occ=0.90, v_occ=0.90, sales=2, isolate_room=True)
    run_test_case("TC-24", "R59: >=90天,双低入住+低成交+过线0.83A", r, base_p * 0.86, "R59", vacancy_days=100, b_occ=0.70, v_occ=0.70, sales=2, isolate_room=True)
    run_test_case("TC-25", "R60: >=90天,双低入住+低成交+大降>15%+破底线0.83A", r, base_p * 0.80, "R60", vacancy_days=100, b_occ=0.70, v_occ=0.70, sales=2, isolate_room=True)
    run_test_case("TC-26", "Out-Of-Bounds: >=90天,单高入住(楼栋高村低)未在PRD定义内", r, base_p * 0.86, "规则外默认拦截", vacancy_days=100, b_occ=0.90, v_occ=0.70, sales=2, isolate_room=True)

    # 写入 Markdown Artifact
    with open('/Users/kyle/Desktop/VIBECODING/PM/门店调价审核agent/test_conclusion_data.md', 'w') as f:
        f.write("\n".join(results_table))
    print("\n所有测试执行完毕！测试结果表格已生成。")

