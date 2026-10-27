open Nanofuzz_runtime

(**
 * Arithmetic Expression Evaluator and Grammar-Based Input Generator
 *
 * Grammar:
 *   Expr   -> Term (( '+' | '-' ) Term)*
 *   Term   -> Factor (( '*' | '/' ) Factor)*
 *   Factor -> Number | '(' Expr ')' | '-' Factor | '+' Factor
 *)

let rec evaluate_expression (expr : string) : float =
  let tokens = _tokenize expr in
  let (res, remaining) = _parse_expr tokens in
  if remaining <> [] then
    failwith (Printf.sprintf "Unexpected trailing tokens starting at '%s'" (List.hd remaining))
  else
    res

and evaluate_expression_generator (prng : unit -> float) : string option =
  let max_depth = 4 in
  Some (_generate_random_expr prng 0 max_depth)

and evaluate_expression_transformer (expr : string) : string =
  assume ~message:"Expression must be syntactically valid" (_is_valid_syntax expr);
  expr

(* -------------------------------------------------------------------------- *)
(* Private Helper Functions (Grammar Generator, Parser & Lexer)               *)
(* -------------------------------------------------------------------------- *)

and _is_valid_syntax (expr : string) : bool =
  match _tokenize_safe expr with
  | Some tokens when tokens <> [] ->
    (match _check_expr tokens with
     | Some remaining -> remaining = []
     | None -> false)
  | _ -> false

and _tokenize (input : string) : string list =
  let len = String.length input in
  let tokens = ref [] in
  let i = ref 0 in
  while !i < len do
    let c = input.[!i] in
    if c = ' ' || c = '\t' || c = '\r' || c = '\n' then
      incr i
    else if c = '+' || c = '-' || c = '*' || c = '/' || c = '(' || c = ')' then begin
      tokens := String.make 1 c :: !tokens;
      incr i
    end else if (c >= '0' && c <= '9') || (c = '.' && !i + 1 < len && input.[!i + 1] >= '0' && input.[!i + 1] <= '9') then begin
      let start = !i in
      while !i < len && ((input.[!i] >= '0' && input.[!i] <= '9') || input.[!i] = '.') do
        incr i
      done;
      tokens := String.sub input start (!i - start) :: !tokens
    end else
      failwith (Printf.sprintf "Unexpected character '%c' at index %d" c !i)
  done;
  List.rev !tokens

and _tokenize_safe (input : string) : string list option =
  try Some (_tokenize input) with _ -> None

and _parse_factor (tokens : string list) : (float * string list) =
  match tokens with
  | [] -> failwith "Unexpected end of input while expecting factor"
  | "(" :: rest ->
    let (val_, after_expr) = _parse_expr rest in
    (match after_expr with
     | ")" :: after_paren -> (val_, after_paren)
     | _ -> failwith "Expected ')'")
  | "-" :: rest ->
    let (v, after) = _parse_factor rest in
    (-.v, after)
  | "+" :: rest ->
    _parse_factor rest
  | tok :: rest ->
    (try (float_of_string tok, rest)
     with _ -> failwith (Printf.sprintf "Invalid numeric token: '%s'" tok))

and _parse_term (tokens : string list) : (float * string list) =
  let (left, rest) = _parse_factor tokens in
  let rec loop acc toks =
    match toks with
    | "*" :: after_op ->
      let (right, after_fac) = _parse_factor after_op in
      loop (acc *. right) after_fac
    | "/" :: after_op ->
      let (right, after_fac) = _parse_factor after_op in
      if right = 0.0 then failwith "Division by zero in arithmetic expression"
      else loop (acc /. right) after_fac
    | _ -> (acc, toks)
  in
  loop left rest

and _parse_expr (tokens : string list) : (float * string list) =
  let (left, rest) = _parse_term tokens in
  let rec loop acc toks =
    match toks with
    | "+" :: after_op ->
      let (right, after_term) = _parse_term after_op in
      loop (acc +. right) after_term
    | "-" :: after_op ->
      let (right, after_term) = _parse_term after_op in
      loop (acc -. right) after_term
    | _ -> (acc, toks)
  in
  loop left rest

and _check_factor (tokens : string list) : string list option =
  match tokens with
  | [] -> None
  | "(" :: rest ->
    (match _check_expr rest with
     | Some (")" :: after_paren) -> Some after_paren
     | _ -> None)
  | ("-" | "+") :: rest ->
    _check_factor rest
  | tok :: rest ->
    (try let _ = float_of_string tok in Some rest
     with _ -> None)

and _check_term (tokens : string list) : string list option =
  match _check_factor tokens with
  | None -> None
  | Some rest ->
    let rec loop toks =
      match toks with
      | ("*" | "/") :: after_op ->
        (match _check_factor after_op with
         | Some after_fac -> loop after_fac
         | None -> None)
      | _ -> Some toks
    in
    loop rest

and _check_expr (tokens : string list) : string list option =
  match _check_term tokens with
  | None -> None
  | Some rest ->
    let rec loop toks =
      match toks with
      | ("+" | "-") :: after_op ->
        (match _check_term after_op with
         | Some after_term -> loop after_term
         | None -> None)
      | _ -> Some toks
    in
    loop rest

and _generate_random_factor (prng : unit -> float) (depth : int) (max_depth : int) : string =
  if depth < max_depth && prng () < 0.3 then
    let inner = _generate_random_expr prng (depth + 1) max_depth in
    Printf.sprintf "(%s)" inner
  else
    let v = int_of_float (prng () *. 100.0) + 1 in
    string_of_int v

and _generate_random_term (prng : unit -> float) (depth : int) (max_depth : int) : string =
  let factor_count = int_of_float (prng () *. 3.0) + 1 in
  let factors = List.init factor_count (fun _ -> _generate_random_factor prng depth max_depth) in
  let ops = List.init (max 0 (factor_count - 1)) (fun _ -> if prng () < 0.5 then " * " else " / ") in
  _interleave factors ops

and _generate_random_expr (prng : unit -> float) (depth : int) (max_depth : int) : string =
  let term_count = int_of_float (prng () *. 3.0) + 1 in
  let terms = List.init term_count (fun _ -> _generate_random_term prng depth max_depth) in
  let ops = List.init (max 0 (term_count - 1)) (fun _ -> if prng () < 0.5 then " + " else " - ") in
  _interleave terms ops

and _interleave (items : string list) (ops : string list) : string =
  match items with
  | [] -> ""
  | [x] -> x
  | x :: xs ->
    let rec loop acc itm op =
      match itm, op with
      | (i :: is), (o :: os) -> loop (acc ^ o ^ i) is os
      | _ -> acc
    in
    loop x xs ops
