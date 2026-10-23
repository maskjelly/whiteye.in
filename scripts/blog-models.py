#!/usr/bin/env python3
"""Small executable models used by the systems essays.

Run: python3 scripts/blog-models.py

These enumerate sets, schedules, and recovery examples. They do not benchmark
hardware, implement the complete named protocols, or inject physical faults.
All inputs are fixed; the JSON output is deterministic.
"""

from collections import deque
from itertools import combinations, permutations
import json


def quorum_overlap():
    results = []
    for replicas, quorum in [(3, 2), (4, 3)]:
        sets = [set(q) for q in combinations(range(replicas), quorum)]
        overlap = [len(a & b) for a, b in combinations(sets, 2)]
        honest = [len((a & b) - {0}) for a, b in combinations(sets, 2)]
        results.append({"replicas": replicas, "quorum": quorum,
                        "distinct_pairs": len(overlap),
                        "minimum_overlap": min(overlap),
                        "minimum_honest_overlap_with_replica_0_faulty": min(honest)})
    return results


def raft_election_example():
    # Rank logs by (last term, last index), as in the election restriction.
    before = {"A": (2, 2), "B": (2, 2), "C": (2, 2),
              "D": (1, 1), "E": (3, 2)}
    after = dict(before, A=(4, 3), B=(4, 3), C=(4, 3))
    cases = []
    # A and B are unavailable when E seeks the later election.
    for label, logs in [("old_entry_on_majority", before),
                        ("current_term_entry_on_majority", after)]:
        eligible = [v for v in ["C", "D", "E"] if logs["E"] >= logs[v]]
        cases.append({"case": label, "candidate": "E",
                      "eligible_reachable_voters": eligible,
                      "can_reach_three_votes": len(eligible) >= 3})
    return cases


def memory_ordering():
    # SC: Wx precedes Ry in thread 0; Wy precedes Rx in thread 1.
    sc = set()
    schedules = 0
    for order in permutations(["Wx", "Ry", "Wy", "Rx"]):
        if order.index("Wx") > order.index("Ry"):
            continue
        if order.index("Wy") > order.index("Rx"):
            continue
        schedules += 1
        mem = {"x": 0, "y": 0}
        regs = {}
        for event in order:
            if event[0] == "W":
                mem[event[1]] = 1
            else:
                regs[event[1]] = mem[event[1]]
        sc.add((regs["y"], regs["x"]))

    # Store-buffer model: (pc0, pc1, x, y, buffered0, buffered1, r0, r1).
    # Each thread stores once, then loads the other address. Each buffer may
    # flush independently. Final states require both buffers to have drained.
    initial = (0, 0, 0, 0, False, False, -1, -1)
    seen = {initial}
    todo = deque([initial])
    buffered = set()
    while todo:
        state = todo.popleft()
        pc0, pc1, x, y, b0, b1, r0, r1 = state
        if pc0 == pc1 == 2 and not b0 and not b1:
            buffered.add((r0, r1))
        next_states = []
        if pc0 == 0:
            next_states.append((1, pc1, x, y, True, b1, r0, r1))
        elif pc0 == 1:
            next_states.append((2, pc1, x, y, b0, b1, y, r1))
        if pc1 == 0:
            next_states.append((pc0, 1, x, y, b0, True, r0, r1))
        elif pc1 == 1:
            next_states.append((pc0, 2, x, y, b0, b1, r0, x))
        if b0:
            next_states.append((pc0, pc1, 1, y, False, b1, r0, r1))
        if b1:
            next_states.append((pc0, pc1, x, 1, b0, False, r0, r1))
        for nxt in next_states:
            if nxt not in seen:
                seen.add(nxt)
                todo.append(nxt)
    assert (0, 0) not in sc and (0, 0) in buffered
    return {"sequentially_consistent_schedules": schedules,
            "sequentially_consistent_outcomes_r0_r1": sorted(sc),
            "store_buffer_outcomes_r0_r1": sorted(buffered),
            "store_buffer_states_visited": len(seen)}


def raid_write_hole():
    d1, old_d2, d3, new_d2 = 0x35, 0x9C, 0xA7, 0x42
    old_parity = d1 ^ old_d2 ^ d3
    new_parity = d1 ^ new_d2 ^ d3
    cases = []
    for data_written, parity_written in [(False, False), (True, False),
                                          (False, True), (True, True)]:
        d2 = new_d2 if data_written else old_d2
        parity = new_parity if parity_written else old_parity
        reconstructed = parity ^ d2 ^ d3
        cases.append({"new_data_persisted": data_written,
                      "new_parity_persisted": parity_written,
                      "reconstructed_D1": hex(reconstructed),
                      "correct": reconstructed == d1})
    return {"D1": hex(d1), "old_D2": hex(old_d2), "D3": hex(d3),
            "new_D2": hex(new_d2), "old_parity": hex(old_parity),
            "new_parity": hex(new_parity), "cases": cases}


def redo_and_retries():
    # Committed WAL contains idempotent set operations A=1 and B=1.
    cases = []
    for pages in [(0, 0), (1, 0), (0, 1), (1, 1)]:
        recovered = list(pages)
        for index, value in [(0, 1), (1, 1)]:
            recovered[index] = value
        cases.append({"persisted_pages_A_B": pages, "after_redo": recovered})
    status, counter = "open", 0
    for _ in range(2):
        status = "cancelled"
        counter += 1
    return {"committed_redo_cases": cases,
            "duplicate_delivery": {"status": status, "counter": counter}}


def lsm_tombstone_example():
    # Point lookups in two runs, newest first. Maps stand in for sorted files;
    # None is a deletion marker. No snapshots, real files, or RocksDB involved.
    older = {"k": "old"}
    newer = {"other": "value"}

    def lookup(runs, key):
        for run in runs:
            if key in run:
                return run[key]
        return None

    before_delete = lookup([newer, older], "k")
    with_tombstone = lookup([dict(newer, k=None), older], "k")
    prematurely_removed = lookup([newer, older], "k")
    assert (before_delete, with_tombstone, prematurely_removed) == ("old", None, "old")
    return {"before_delete": before_delete, "with_tombstone": with_tombstone,
            "after_premature_tombstone_removal": prematurely_removed}


def network_tail_example():
    a = [100] * 6 + [0] * 994
    b = [0] * 6 + [100] * 6 + [0] * 988

    def p99(samples):
        # Nearest-rank percentile: rank ceil(0.99 * 1000) = 990.
        return sorted(samples)[989]

    return {"requests": len(a), "slow_requests_per_stage": 6,
            "slow_requests_overlap": False, "stage_A_p99_ms": p99(a),
            "stage_B_p99_ms": p99(b),
            "end_to_end_p99_ms": p99([x + y for x, y in zip(a, b)])}


def polynomial_examples():
    # Four conceptual one-cycle Horner stages, accepting one x each cycle.
    def horner(x):
        value = 5
        for coefficient in [4, 3, 2, 1]:
            value = value * x + coefficient
        return value

    stages = [None] * 4
    pipeline = []
    for cycle in range(9):
        completed = stages[-1]
        if completed is not None:
            x, value, accepted = completed
            assert value == horner(x)
            pipeline.append({"accepted_cycle": accepted,
                             "output_cycle": cycle, "x": x, "value": value})
        following = [None] * 4
        if cycle < 5:
            following[0] = (cycle, 5 * cycle + 4, cycle)
        for stage, coefficient in [(1, 3), (2, 2), (3, 1)]:
            previous = stages[stage - 1]
            if previous is not None:
                x, value, accepted = previous
                following[stage] = (x, value * x + coefficient, accepted)
        stages = following

    # At x=1, Chebyshev recurrence T[n+1]=2x*T[n]-T[n-1] gives
    # T[n]=1 and D[n+1]=2+2*D[n]-D[n-1], with D[0]=0,D[1]=1.
    derivatives = {0: 0, 1: 1}
    for n in range(1, 64):
        derivatives[n + 1] = 2 + 2 * derivatives[n] - derivatives[n - 1]
    return {"four_stage_pipeline": pipeline,
            "bounded_polynomial_error": {
                "epsilon": 1e-6, "interval": [-1, 1],
                "error_function": "epsilon * T_n(x)",
                "maximum_absolute_value_error": 1e-6,
                "derivative_error_at_x_1": [
                    {"degree": n, "value": 1e-6 * derivatives[n]}
                    for n in [8, 32, 64]]}}


if __name__ == "__main__":
    result = {"quorums": quorum_overlap(), "raft": raft_election_example(),
              "memory": memory_ordering(), "raid": raid_write_hole(),
              "redo": redo_and_retries(), "lsm": lsm_tombstone_example(),
              "network": network_tail_example(),
              "polynomials": polynomial_examples()}
    print(json.dumps(result, indent=2, sort_keys=True))
