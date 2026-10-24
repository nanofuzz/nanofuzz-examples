open Nanofuzz_runtime

(**
 * Least-Recently-Used (LRU) Key-Value Cache with fixed capacity.
 *
 * When the number of stored entries reaches capacity, adding a new key
 * evicts the least recently accessed (retrieved or inserted) entry.
 *)
type ('k, 'v) lru_cache = {
  mutable entries : ('k * 'v) list;
  cap : int;
}

let create (capacity : int) : ('k, 'v) lru_cache =
  assert_true ~message:"Capacity must be a positive integer" (capacity > 0);
  { entries = []; cap = capacity }

let get (cache : ('k, 'v) lru_cache) (key : 'k) : 'v option =
  match List.assoc_opt key cache.entries with
  | Some v ->
    let rest = List.remove_assoc key cache.entries in
    cache.entries <- rest @ [(key, v)];
    Some v
  | None -> None

let put (cache : ('k, 'v) lru_cache) (key : 'k) (value : 'v) : unit =
  let rest = List.remove_assoc key cache.entries in
  let trimmed =
    if List.length rest >= cache.cap then
      match rest with _ :: tl -> tl | [] -> []
    else
      rest
  in
  cache.entries <- trimmed @ [(key, value)]

let has (cache : ('k, 'v) lru_cache) (key : 'k) : bool =
  List.mem_assoc key cache.entries

let remove (cache : ('k, 'v) lru_cache) (key : 'k) : bool =
  if List.mem_assoc key cache.entries then begin
    cache.entries <- List.remove_assoc key cache.entries;
    true
  end else
    false

let size (cache : ('k, 'v) lru_cache) : int =
  List.length cache.entries

let capacity (cache : ('k, 'v) lru_cache) : int =
  cache.cap

let is_empty (cache : ('k, 'v) lru_cache) : bool =
  cache.entries = []

let clear (cache : ('k, 'v) lru_cache) : unit =
  cache.entries <- []

let keys (cache : ('k, 'v) lru_cache) : 'k list =
  List.map fst cache.entries

(**
 * Test harness verifying that LRUCache maintains all invariants across
 * a sequence of operations.
 *)
let test_lru_cache (capacity : int) (operations : (string * string * int) list) : bool =
  if capacity <= 0 || capacity > 32 then true
  else begin
    let lru = create capacity in
    let shadow = ref [] in

    List.iter (fun (raw_op, key, val_) ->
      let op = String.lowercase_ascii (String.trim raw_op) in
      if op = "put" || (String.length op >= 2 && String.sub op 0 2 = "pu") || op = "+" then begin
        put lru key val_;
        let rest = List.remove_assoc key !shadow in
        let trimmed =
          if List.length rest >= capacity then
            match rest with _ :: tl -> tl | [] -> []
          else rest
        in
        shadow := trimmed @ [(key, val_)]
      end else if op = "get" || (String.length op >= 1 && String.sub op 0 1 = "g") || op = "?" then begin
        let got = get lru key in
        let expected = List.assoc_opt key !shadow in
        assert_eq ~message:"get mismatch" got expected;
        if expected <> None then begin
          let rest = List.remove_assoc key !shadow in
          shadow := rest @ [(key, Option.get expected)]
        end
      end else if op = "has" || (String.length op >= 1 && String.sub op 0 1 = "h") then begin
        let had = has lru key in
        let expected = List.mem_assoc key !shadow in
        assert_eq ~message:"has mismatch" had expected
      end else if op = "remove" || (String.length op >= 1 && String.sub op 0 1 = "r") || op = "-" then begin
        let removed = remove lru key in
        let expected = List.mem_assoc key !shadow in
        assert_eq ~message:"remove mismatch" removed expected;
        shadow := List.remove_assoc key !shadow
      end else if op = "clear" || (String.length op >= 2 && String.sub op 0 2 = "cl") then begin
        clear lru;
        shadow := []
      end;

      assert_eq ~message:"size mismatch" (size lru) (List.length !shadow);
      assert_eq ~message:"is_empty mismatch" (is_empty lru) (!shadow = []);
      assert_eq ~message:"keys mismatch" (keys lru) (List.map fst !shadow)
    ) operations;

    true
  end

(**
 * User-provided input generator producing realistic LRU cache operation sequences.
 *)
let test_lru_cache_generator (prng : unit -> float) : (int * (string * string * int) list) option =
  let cap = int_of_float (prng () *. 4.0) + 1 in
  let op_count = int_of_float (prng () *. 10.0) + 1 in
  let op_names = [|"put"; "get"; "has"; "remove"; "clear"|] in
  let key_names = [|"k1"; "k2"; "k3"; "k4"|] in
  let ops = List.init op_count (fun _ ->
    let op = op_names.(int_of_float (prng () *. 5.0)) in
    let key = key_names.(int_of_float (prng () *. 4.0)) in
    let val_ = int_of_float (prng () *. 100.0) in
    (op, key, val_)
  ) in
  Some (cap, ops)
