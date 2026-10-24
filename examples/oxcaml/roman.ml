open Nanofuzz_runtime

(**
 * Adapted from: https://rosettacode.org/wiki/Roman_numerals/Decode#ES5
 *           and https://rosettacode.org/wiki/Roman_numerals/Encode#TypeScript
 *)

let weights_symbols = [
  (1000, "M");
  (900, "CM");
  (500, "D");
  (400, "CD");
  (100, "C");
  (90, "XC");
  (50, "L");
  (40, "XL");
  (10, "X");
  (9, "IX");
  (5, "V");
  (4, "IV");
  (1, "I");
]

let _replace_first (sub : string) (s : string) : string =
  let sub_len = String.length sub in
  let s_len = String.length s in
  let rec find_idx i =
    if i + sub_len > s_len then None
    else if String.sub s i sub_len = sub then Some i
    else find_idx (i + 1)
  in
  match find_idx 0 with
  | Some idx ->
    let prefix = String.sub s 0 idx in
    let suffix = String.sub s (idx + sub_len) (s_len - (idx + sub_len)) in
    prefix ^ suffix
  | None -> s

let decode_roman (str : string) : int =
  let result = ref 0 in
  let current = ref str in
  List.iter (fun (w, s) ->
    while String.length !current > 0 &&
          let sub_len = String.length s in
          let s_len = String.length !current in
          let rec has_sub i =
            if i + sub_len > s_len then false
            else if String.sub !current i sub_len = s then true
            else has_sub (i + 1)
          in
          has_sub 0
    do
      result := !result + w;
      current := _replace_first s !current
    done
  ) weights_symbols;
  !result

let to_roman (n : int) : string =
  let roman = ref "" in
  let num = ref n in
  let ws_arr = Array.of_list weights_symbols in
  (* Bug from TypeScript example: off-by-one condition i <= Array.length causes index out of bounds *)
  let i = ref 0 in
  while !i <= Array.length ws_arr && !num > 0 do
    let (w, s) = ws_arr.(!i) in
    while !num >= w do
      roman := !roman ^ s;
      num := !num - w
    done;
    incr i
  done;
  !roman

let decode_roman_validator (r : Nanofuzz_runtime.fuzz_test_result) : validator_result =
  match Nanofuzz_runtime.get_out r, Nanofuzz_runtime.get_in 0 r with
  | `Int out_val, Some (`String s) ->
    if out_val >= String.length s then Pass else Fail
  | _ -> Fail

let to_roman_validator (r : Nanofuzz_runtime.fuzz_test_result) : validator_result =
  match Nanofuzz_runtime.get_out r, Nanofuzz_runtime.get_in 0 r with
  | `String roman_str, Some (`Int in_val) ->
    if decode_roman roman_str = in_val then Pass else Fail
  | _ -> Fail
