open Nanofuzz_runtime

(**
 * Adapted from: https://rosettacode.org/wiki/Identity_matrix#TypeScript
 *
 * This function returns an identity matrix of n x n size such that:
 *   n = 1 => [[1]],
 *   n = 2 => [[1,0],[0,1]],
 *   n = 3 => [[1,0,0],[0,1,0],[0,0,1]],
 *   ... and so on ...
 *
 * @param n finite integer >= 1
 * @returns int[n][n] identity matrix of n x n size
 *)
let identity (n : int) : int array array =
  if n <= 0 then [||]
  else
    let row = Array.make n 0 in
    let matrix = Array.make n row in
    for i = 0 to n - 1 do
      matrix.(i).(i) <- 1
    done;
    matrix

let identity_validator (r : Nanofuzz_runtime.fuzz_test_result) : validator_result =
  match Nanofuzz_runtime.get_out r with
  | `List rows ->
    let len = List.length rows in
    let valid =
      List.mapi (fun i row ->
        match row with
        | `List cols ->
          List.length cols = len &&
          List.mapi (fun j col ->
            match col with
            | `Int v -> if i = j then v = 1 else v = 0
            | _ -> false
          ) cols |> List.for_all (fun x -> x)
        | _ -> false
      ) rows |> List.for_all (fun x -> x)
    in
    if valid then Pass else Fail
  | _ -> Fail
