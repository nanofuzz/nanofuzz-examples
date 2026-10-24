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

(**
 * Test harness verifying that MinStack maintains all invariants across
 * a sequence of operations.
 *)
let test_min_stack (operations : (string * int) list) : bool =
  let ms = create () in
  let shadow = ref [] in

  List.iter (fun (raw_op, val_) ->
    let op = String.lowercase_ascii (String.trim raw_op) in
    if op = "push" || (String.length op >= 2 && String.sub op 0 2 = "pu") || op = "+" then begin
      push ms val_;
      shadow := !shadow @ [val_]
    end else if op = "pop" || (String.length op >= 2 && String.sub op 0 2 = "po") || op = "-" then begin
      let popped = pop ms in
      let expected =
        match List.rev !shadow with
        | x :: rest ->
          shadow := List.rev rest;
          Some x
        | [] -> None
      in
      assert_eq ~message:"pop mismatch" popped expected
    end else if op = "top" || (String.length op >= 1 && String.sub op 0 1 = "t") || op = "?" then begin
      let topped = top ms in
      let expected =
        match List.rev !shadow with
        | x :: _ -> Some x
        | [] -> None
      in
      assert_eq ~message:"top mismatch" topped expected
    end else if op = "min" || (String.length op >= 1 && String.sub op 0 1 = "m") then begin
      let min_val = get_min ms in
      let expected =
        match !shadow with
        | [] -> None
        | xs -> Some (List.fold_left min (List.hd xs) (List.tl xs))
      in
      assert_eq ~message:"get_min mismatch" min_val expected
    end else if op = "clear" || (String.length op >= 2 && String.sub op 0 2 = "cl") then begin
      clear ms;
      shadow := []
    end;

    assert_eq ~message:"size mismatch" (size ms) (List.length !shadow);
    assert_eq ~message:"is_empty mismatch" (is_empty ms) (!shadow = []);
    let current_min = get_min ms in
    let expected_min =
      match !shadow with
      | [] -> None
      | xs -> Some (List.fold_left min (List.hd xs) (List.tl xs))
    in
    assert_eq ~message:"invariant get_min mismatch" current_min expected_min
  ) operations;

  true

(**
 * User-provided input generator producing realistic MinStack operation sequences.
 *)
let test_min_stack_generator (prng : unit -> float) : ((string * int) list) option =
  let op_count = int_of_float (prng () *. 10.0) + 1 in
  let op_names = [|"push"; "pop"; "top"; "min"; "clear"|] in
  let ops = List.init op_count (fun _ ->
    let op = op_names.(int_of_float (prng () *. 5.0)) in
    let v = int_of_float (prng () *. 200.0) - 100 in
    (op, v)
  ) in
  Some ops
