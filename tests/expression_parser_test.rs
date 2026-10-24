use expression_parser::{evaluate_expression, evaluate_expression_transformer};
use nanofuzz_runtime::UnsatisfiedAssumption;

#[test]
fn test_evaluate_expression() {
    assert_eq!(evaluate_expression("2 + 3 * 4"), 14.0);
    assert_eq!(evaluate_expression("(2 + 3) * 4"), 20.0);
}

#[test]
fn test_evaluate_expression_transformer_valid() {
    let res = evaluate_expression_transformer("2 + 3 * 4");
    assert_eq!(res, ("2 + 3 * 4".to_string(),));
}

#[test]
fn test_evaluate_expression_transformer_invalid() {
    let check_skip = |expr: &str| {
        let panic_payload = std::panic::catch_unwind(|| {
            evaluate_expression_transformer(expr);
        });
        assert!(
            panic_payload.is_err(),
            "Expected panic for invalid expression: {}",
            expr
        );
        let err = panic_payload.unwrap_err();
        assert!(
            err.downcast_ref::<UnsatisfiedAssumption>().is_some(),
            "Expected UnsatisfiedAssumption panic for: {}",
            expr
        );
    };

    check_skip("yo dawg");
    check_skip("1 + ");
    check_skip("(1 + 2");
    check_skip("");
}
