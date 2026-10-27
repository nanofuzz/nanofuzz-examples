open Nanofuzz_runtime

(**
 * LIFO Stack that supports push, pop, top, and retrieving the minimum element in O(1) time.
 *
 * An auxiliary stack of prefix minimums is maintained in lockstep with the
 * elements stack so that minimum lookups require no traversal.
 *)
type 'a min_stack = {
  mutable elements : 'a list;
  mutable min_elements : 'a list;
}

let create () : 'a min_stack =
  { elements = []; min_elements = [] }

let push (ms : 'a min_stack) (val_ : 'a) : unit =
  let current_min =
    match ms.min_elements with
    | [] -> val_
    | m :: _ -> if val_ < m then val_ else m
  in
  ms.elements <- val_ :: ms.elements;
  ms.min_elements <- current_min :: ms.min_elements

let pop (ms : 'a min_stack) : 'a option =
  match ms.elements, ms.min_elements with
  | [], _ -> None
  | x :: xs, _ :: ms_rest ->
    ms.elements <- xs;
    ms.min_elements <- ms_rest;
    Some x
  | _ -> None

let top (ms : 'a min_stack) : 'a option =
  match ms.elements with
  | [] -> None
  | x :: _ -> Some x

let get_min (ms : 'a min_stack) : 'a option =
  match ms.min_elements with
  | [] -> None
  | m :: _ -> Some m

let size (ms : 'a min_stack) : int =
  List.length ms.elements

let is_empty (ms : 'a min_stack) : bool =
  ms.elements = []

let clear (ms : 'a min_stack) : unit =
  ms.elements <- [];
  ms.min_elements <- []

let to_list (ms : 'a min_stack) : 'a list =
  List.rev ms.elements

type stack_op = Push | Pop | Top | Min | Clear

(**
 * Test harness verifying that MinStack maintains all invariants across
 * a sequence of operations.
 *)
let test_min_stack (operations : (stack_op * int) list) : bool =
  let ms = create () in
  let shadow = ref [] in

  List.iter (fun (op, val_) ->
    match op with
    | Push ->
      push ms val_;
      shadow := !shadow @ [val_]
    | Pop ->
      let popped = pop ms in
      let expected =
        match List.rev !shadow with
        | x :: rest ->
          shadow := List.rev rest;
          Some x
        | [] -> None
      in
      assert_eq ~message:"pop mismatch" popped expected
    | Top ->
      let topped = top ms in
      let expected =
        match List.rev !shadow with
        | x :: _ -> Some x
        | [] -> None
      in
      assert_eq ~message:"top mismatch" topped expected
    | Min ->
      let min_val = get_min ms in
      let expected =
        match !shadow with
        | [] -> None
        | xs -> Some (List.fold_left min (List.hd xs) (List.tl xs))
      in
      assert_eq ~message:"get_min mismatch" min_val expected
    | Clear ->
      clear ms;
      shadow := []
  ) operations;

  assert_eq ~message:"size mismatch" (size ms) (List.length !shadow);
  assert_eq ~message:"is_empty mismatch" (is_empty ms) (!shadow = []);
  let current_min = get_min ms in
  let expected_min =
    match !shadow with
    | [] -> None
    | xs -> Some (List.fold_left min (List.hd xs) (List.tl xs))
  in
  assert_eq ~message:"invariant get_min mismatch" current_min expected_min;

  true

(**
 * User-provided input generator producing realistic MinStack operation sequences.
 *)
let test_min_stack_generator (prng : unit -> float) : ((stack_op * int) list) option =
  let op_count = int_of_float (prng () *. 10.0) + 1 in
  let op_variants = [|Push; Pop; Top; Min; Clear|] in
  let ops = List.init op_count (fun _ ->
    let op = op_variants.(int_of_float (prng () *. 5.0)) in
    let v = int_of_float (prng () *. 200.0) - 100 in
    (op, v)
  ) in
  Some ops
