/*
 * Essentials of interpretation.
 * by Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 *
 * Lesson 1. The simplest arithmetic expressions (AE) evaluator.
 *
 * We use BNF (Backus-Naur Form) grammar to represent our language:
 *
 * <AE> ::= <num>
 *        | ["+" <AE> <AE>]
 *        | ["-" <AE> <AE>]
 *
 * <AE> non-terminal stands for Arithmetic Expression and is our Program.
 * ::= means "can be represented as"
 * | means OR
 * "+" and "-" are terminals.
 *
 * We use "parenthesized prefix" notation to represent
 * programs and expressions: [operator operand operand]
 *
 * To interpret this program we need a special procedure,
 * which is called "evaluator" ("eval" in short notation).
 *
 */

/**
 * evaluate
 * @param {Program} exp
 * Case analysis of the expression.
 *
 * "eval" accepts expression to evaluate
 * and depending on the expression's type
 * executes appropriate evaluating procedure
 */
function evaluate(exp) {

  // if it's a number, eval a number
  if (isNumber(exp))
    return evaluateNumber(exp);

  // if it's addition, eval the addition
  if (isAddition(exp))
    return evaluateAddition(exp);

  // if it's a subtraction, eval the subtraction
  if (isSubtraction(exp))
    return evaluateSubtraction(exp);

  // etc., that is, quite simple "switch-case"
  // anaylisis of the expression type

}

/**
 * isNumber
 * @param {Expression} exp
 * Tests whether an expression is a number
 */
function isNumber(exp) {
  return !isNaN(+exp);
}

/**
 * isAddition
 * @param {Expression} exp
 * Tests whether an expression is a addition
 */
function isAddition(exp) {
  return isTaggedList("+", exp);
}

/**
 * isSubtraction
 * @param {Expression} exp
 * Tests whether an expression is a subtraction
 */
function isSubtraction(exp) {
  return isTaggedList("-", exp);
}

/**
 * isTaggedList
 * @param {Expression} exp
 *
 * Main expression type testing function; used by
 * isAddition and isSubtraction testers.
 *
 * We represent programs as arrays (lists), which
 * are close to abstract syntax trees (AST) in
 * this case. Every complex expression has a type,
 * which is the first element of the expression "array".
 *
 * Example:
 *
 * Expression ["+", A, B] is the "addition" since
 * its first element (the "tag") is "+"
 *
 */
function isTaggedList(tag, exp) {
  return exp[0] == tag;
}

/**
 * evaluateNumber
 * @param {Expression} exp
 * Numbers are the simplest expressions in
 * this interpreter (also known as, "self-evaluating"
 * expressions), so just return the number
 * representation in JS.
 */
function evaluateNumber(exp) {
  return +exp;
}

/**
 * evaluateAddition
 * @param {Expression} exp
 * For addition we recursively evaluate
 * left-hand side (LHS), i.e. exp[1] and
 * right-hand side (RHS), i.e. exp[2].
 *
 * E.g.:
 *
 * ["+", "1", "2"]
 *
 * Recursion with evaluate(...) is needed to handle
 * nested expressions, e.g.:
 *
 * ["+", ["+", "1", "5"], "2"]
 */
function evaluateAddition(exp) {
  return evaluate(exp[1]) + evaluate(exp[2]);
}

/**
 * evaluateSubtraction
 * @param {Expression} exp
 * The behavior of evaluting subtraction is
 * the same as eval'ing addition, see: evaluateAddition
 */
function evaluateSubtraction(exp) {
  return evaluate(exp[1]) - evaluate(exp[2]);
}

// we represent program in "parenthesized prefix"
// form, that is: (operator operands)

// the simplest addition
var program = ["+", "1", "3"];
var result = evaluate(program);
console.log("result:", result); // 4

// more complex addition
program = ["+", ["+", "1", "4"], ["-", "7", "2"]];
result = evaluate(program);

console.log("result:", result); // 10

// Exercises:
//
// 1. Implement multiplication and division
//
// 2. Encapsulate and improve handling of similar
//    expression types in "eval" reusing the code by getting
//    the type and running needed evaluator by dynamic name:
//    E.g.:
//      var expressionType = getType(exp);
//      return this["evaluate" + expressionType](exp);
//
// 3. Write a parser which translates concrete syntax to AST.
//    Chose any concrete syntax, e.g. infix math notation:
//    1 + 3 -> ["+", "1", "3"].
