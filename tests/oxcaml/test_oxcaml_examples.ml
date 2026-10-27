open OUnit2
open Nanofuzz_runtime
open Oxcaml_examples

let test_expression_parser _ =
  let res1 = Expression_parser.evaluate_expression "2 + 3 * 4" in
  assert_equal 14.0 res1;
  let res2 = Expression_parser.evaluate_expression "(2 + 3) * 4" in
  assert_equal 20.0 res2;

  let transformed = Expression_parser.evaluate_expression_transformer "2 + 3 * 4" in
  assert_equal "2 + 3 * 4" transformed;

  assert_raises (Unsatisfied_assumption "Expression must be syntactically valid") (fun () ->
    Expression_parser.evaluate_expression_transformer "invalid + "
  )

let test_circular_buffer _ =
  let cb = Circular_buffer.create 3 in
  assert_bool "isEmpty" (Circular_buffer.is_empty cb);
  assert_bool "push 10" (Circular_buffer.push cb 10);
  assert_bool "push 20" (Circular_buffer.push cb 20);
  assert_bool "push 30" (Circular_buffer.push cb 30);
  assert_bool "not push 40" (not (Circular_buffer.push cb 40));
  assert_bool "isFull" (Circular_buffer.is_full cb);
  assert_equal 3 (Circular_buffer.size cb);
  assert_equal (Some 10) (Circular_buffer.peek cb);
  assert_equal (Some 10) (Circular_buffer.pop cb);
  assert_bool "push 40" (Circular_buffer.push cb 40);
  assert_equal [20; 30; 40] (Circular_buffer.to_list cb);
  assert_equal (Some 20) (Circular_buffer.pop cb);
  assert_equal (Some 30) (Circular_buffer.pop cb);
  assert_equal (Some 40) (Circular_buffer.pop cb);
  assert_equal None (Circular_buffer.pop cb);
  assert_bool "isEmpty end" (Circular_buffer.is_empty cb);

  assert_bool "test_circular_buffer harness"
    (Circular_buffer.test_circular_buffer 3 [
      (Circular_buffer.Push, 1);
      (Circular_buffer.Push, 2);
      (Circular_buffer.Pop, 0);
      (Circular_buffer.Clear, 0);
    ])

let test_min_stack _ =
  let ms = Min_stack.create () in
  assert_bool "isEmpty" (Min_stack.is_empty ms);
  assert_equal None (Min_stack.get_min ms);
  assert_equal None (Min_stack.pop ms);

  Min_stack.push ms 5;
  assert_equal (Some 5) (Min_stack.get_min ms);
  Min_stack.push ms 3;
  assert_equal (Some 3) (Min_stack.get_min ms);
  Min_stack.push ms 7;
  assert_equal (Some 3) (Min_stack.get_min ms);
  Min_stack.push ms 3;
  assert_equal (Some 3) (Min_stack.get_min ms);

  assert_equal (Some 3) (Min_stack.top ms);
  assert_equal (Some 3) (Min_stack.pop ms);
  assert_equal (Some 3) (Min_stack.get_min ms);
  assert_equal (Some 7) (Min_stack.pop ms);
  assert_equal (Some 3) (Min_stack.get_min ms);
  assert_equal (Some 3) (Min_stack.pop ms);
  assert_equal (Some 5) (Min_stack.get_min ms);
  assert_equal 1 (Min_stack.size ms);
  assert_equal (Some 5) (Min_stack.pop ms);
  assert_bool "isEmpty end" (Min_stack.is_empty ms);

  assert_bool "test_min_stack harness"
    (Min_stack.test_min_stack [
      (Min_stack.Push, 10);
      (Min_stack.Push, 5);
      (Min_stack.Min, 0);
      (Min_stack.Pop, 0);
    ])

let test_lru_cache _ =
  let lru = Lru_cache.create 2 in
  Lru_cache.put lru "a" 1;
  Lru_cache.put lru "b" 2;
  assert_equal (Some 1) (Lru_cache.get lru "a");
  Lru_cache.put lru "c" 3; (* evicts "b" *)
  assert_bool "not has b" (not (Lru_cache.has lru "b"));
  assert_equal None (Lru_cache.get lru "b");
  assert_equal (Some 3) (Lru_cache.get lru "c");
  assert_equal (Some 1) (Lru_cache.get lru "a");
  assert_equal ["c"; "a"] (Lru_cache.keys lru);
  assert_bool "remove c" (Lru_cache.remove lru "c");
  assert_equal 1 (Lru_cache.size lru);

  assert_bool "test_lru_cache harness"
    (Lru_cache.test_lru_cache 2 [
      (Lru_cache.Put, "k1", 10);
      (Lru_cache.Put, "k2", 20);
      (Lru_cache.Get, "k1", 0);
      (Lru_cache.Remove, "k2", 0);
    ])

let test_levenshtein _ =
  assert_equal 3 (Levenshtein.levenshtein "kitten" "sitting");
  assert_equal 0 (Levenshtein.levenshtein "hello" "hello")

let test_identity_matrix _ =
  let m = Identity_matrix.identity 3 in
  assert_equal 3 (Array.length m)

let test_roman _ =
  assert_equal 6 (Roman.decode_roman "IV"); (* Note RosettaCode known bug: V before IV *)
  assert_equal 6 (Roman.decode_roman "VI");
  assert_equal 2026 (Roman.decode_roman "MMXXIV");
  assert_equal "VI" (Roman.to_roman 6);
  assert_equal "XXIV" (Roman.to_roman 24)

let suite =
  "OxcamlExamplesTests" >::: [
    "test_expression_parser" >:: test_expression_parser;
    "test_circular_buffer" >:: test_circular_buffer;
    "test_min_stack" >:: test_min_stack;
    "test_lru_cache" >:: test_lru_cache;
    "test_levenshtein" >:: test_levenshtein;
    "test_identity_matrix" >:: test_identity_matrix;
    "test_roman" >:: test_roman;
  ]

let () =
  run_test_tt_main suite
