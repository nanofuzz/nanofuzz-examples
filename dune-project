(lang dune 2.9)
(name nanofuzz_examples)

(package
 (name nanofuzz_examples)
 (synopsis "NaNofuzz examples")
 (depends
  (ocaml (>= 4.08.0))
  (dune (>= 2.9.0))
  (yojson (>= 1.6.0))
  (msgpck (>= 1.7))
  (ounit2 :with-test)))
