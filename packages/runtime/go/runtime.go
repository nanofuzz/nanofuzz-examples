// Package runtime provides runtime support and types for NaNofuzz test suites,
// input transformers, and property validators in Go.
package runtime

import "fmt"

// UnsatisfiedAssumptionError is an error type indicating an input was filtered out
// by an assume(...) condition in a test harness or input transformer.
type UnsatisfiedAssumptionError struct {
	Message string
}

func (e *UnsatisfiedAssumptionError) Error() string {
	if e.Message != "" {
		return fmt.Sprintf("unsatisfied assumption: %s", e.Message)
	}
	return "unsatisfied assumption"
}

// Assume filters out out-of-domain inputs by panicking with an UnsatisfiedAssumptionError
// when the given condition is false.
func Assume(cond bool, msg ...string) {
	if !cond {
		m := ""
		if len(msg) > 0 {
			m = msg[0]
		}
		panic(&UnsatisfiedAssumptionError{Message: m})
	}
}

// ValidatorResult represents the outcome of a property validator.
type ValidatorResult string

const (
	Pass ValidatorResult = "pass"
	Fail ValidatorResult = "fail"
	Skip ValidatorResult = "skip"
)

// FuzzTestResult provides test execution details to property validators.
type FuzzTestResult struct {
	In        []interface{} `json:"in"`
	Out       interface{}   `json:"out"`
	Exception bool          `json:"exception"`
	Timeout   bool          `json:"timeout"`
}

// GetIn returns the i-th input argument, or nil if out of bounds.
func (r *FuzzTestResult) GetIn(i int) interface{} {
	if i < 0 || i >= len(r.In) {
		return nil
	}
	return r.In[i]
}

// GetOut returns the output of the function under test.
func (r *FuzzTestResult) GetOut() interface{} {
	return r.Out
}
