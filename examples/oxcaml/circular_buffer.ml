open Nanofuzz_runtime

(**
 * Fixed-capacity circular FIFO buffer (ring buffer).
 *
 * Allocates a fixed-size contiguous array and uses head and tail indices
 * with modulo arithmetic to achieve constant-time push, pop, and peek operations.
 *)
type 'a circular_buffer = {
  buffer : 'a option array;
  mutable head : int;
  mutable tail : int;
  mutable count : int;
  cap : int;
}

let create (capacity : int) : 'a circular_buffer =
  assert_true ~message:"Capacity must be a positive integer" (capacity > 0);
  {
    buffer = Array.make capacity None;
    head = 0;
    tail = 0;
    count = 0;
    cap = capacity;
  }

let push (cb : 'a circular_buffer) (item : 'a) : bool =
  if cb.count = cb.cap then false
  else begin
    cb.buffer.(cb.tail) <- Some item;
    cb.tail <- (cb.tail + 1) mod cb.cap;
    cb.count <- cb.count + 1;
    true
  end

let pop (cb : 'a circular_buffer) : 'a option =
  if cb.count = 0 then None
  else begin
    let item = cb.buffer.(cb.head) in
    cb.buffer.(cb.head) <- None;
    cb.head <- (cb.head + 1) mod cb.cap;
    cb.count <- cb.count - 1;
    item
  end

let peek (cb : 'a circular_buffer) : 'a option =
  if cb.count = 0 then None
  else cb.buffer.(cb.head)

let size (cb : 'a circular_buffer) : int =
  cb.count

let capacity (cb : 'a circular_buffer) : int =
  cb.cap

let is_empty (cb : 'a circular_buffer) : bool =
  cb.count = 0

let is_full (cb : 'a circular_buffer) : bool =
  cb.count = cb.cap

let clear (cb : 'a circular_buffer) : unit =
  Array.fill cb.buffer 0 cb.cap None;
  cb.head <- 0;
  cb.tail <- 0;
  cb.count <- 0

let to_list (cb : 'a circular_buffer) : 'a list =
  let result = ref [] in
  for i = cb.count - 1 downto 0 do
    let idx = (cb.head + i) mod cb.cap in
    match cb.buffer.(idx) with
    | Some x -> result := x :: !result
    | None -> ()
  done;
  !result

(**
 * Test harness verifying that CircularBuffer maintains all invariants across
 * a sequence of operations.
 *)
let test_circular_buffer (capacity : int) (operations : (string * int) list) : bool =
  if capacity <= 0 || capacity > 64 then true
  else begin
    let cb = create capacity in
    let shadow = ref [] in

    List.iter (fun (raw_op, val_) ->
      let op = String.lowercase_ascii (String.trim raw_op) in
      if op = "push" || (String.length op >= 2 && String.sub op 0 2 = "pu") || op = "+" then begin
        let added = push cb val_ in
        if List.length !shadow < capacity then begin
          assert_true ~message:"push failed when capacity was available" added;
          shadow := !shadow @ [val_]
        end else
          assert_true ~message:"push succeeded when buffer was full" (not added)
      end else if op = "pop" || (String.length op >= 2 && String.sub op 0 2 = "po") || op = "-" then begin
        let popped = pop cb in
        match !shadow with
        | expected :: rest ->
          assert_eq ~message:"pop mismatch" popped (Some expected);
          shadow := rest
        | [] ->
          assert_eq ~message:"pop on empty buffer" popped None
      end else if op = "peek" || (String.length op >= 2 && String.sub op 0 2 = "pe") || op = "?" then begin
        let peeked = peek cb in
        let expected = match !shadow with x :: _ -> Some x | [] -> None in
        assert_eq ~message:"peek mismatch" peeked expected
      end else if op = "clear" || (String.length op >= 2 && String.sub op 0 2 = "cl") then begin
        clear cb;
        shadow := []
      end;

      assert_eq ~message:"size mismatch" (size cb) (List.length !shadow);
      assert_eq ~message:"is_empty mismatch" (is_empty cb) (!shadow = []);
      assert_eq ~message:"is_full mismatch" (is_full cb) (List.length !shadow = capacity);
      assert_eq ~message:"to_list mismatch" (to_list cb) !shadow
    ) operations;

    true
  end

(**
 * User-provided input generator producing realistic circular buffer operation sequences.
 *)
let test_circular_buffer_generator (prng : unit -> float) : (int * (string * int) list) option =
  let cap = int_of_float (prng () *. 8.0) + 1 in
  let op_count = int_of_float (prng () *. 10.0) + 1 in
  let op_names = [|"push"; "pop"; "peek"; "clear"|] in
  let ops = List.init op_count (fun _ ->
    let op = op_names.(int_of_float (prng () *. 4.0)) in
    let v = int_of_float (prng () *. 100.0) in
    (op, v)
  ) in
  Some (cap, ops)
