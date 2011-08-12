/*
 * Essentials of interpretation.
 * by Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 *
 * Lesson 3. Parsing. Parser of AE in math infix notation.
 *
 * In this lesson we continue implementation of our parser
 * started in lesson 2 where we've written the first part
 * of the parsing process -- the lexer (or scanner, tokenizer).
 *
 * The work of the parser is similar to work of the lexer. The
 * difference is that parser already works with higher abstractions
 * known as "tokens" (which are provided by the lexer). That is,
 * lexer built tokens from chars, and parser build semantic nodes
 * from tokens. On the return from parser we already should get
 * the complete AST in the format which is understandable for
 * our interpreter.
 *
 * Source -> Lexer -> Parser -> Interpreter, e.g.:
 *
 * "1 + 2" -> ["1", "+", "2"] -> ["+", "1", "2"] -> 3
 *
 * We assume here the interpreter with supporting multiplication
 * and division (exercise 1 from lesson 1) -- to work with the
 * precedence: 2 + 2 * 2 should be 6 (by the school math ;)), not 8,
 * if we hadn't consider the precedence. On the other hand,
 * (2 + 2) * 2 should be 8, since grouping operator has the highest priority.
 *
 * Dependencies for this lesson:
 *   1. Improved "evaluate" function (with * and /) from lesson 1
 *   2. Lexer constructor from lesson 2
 *
 * So let's start with the parser.
 *
 */

/**
 * @class Parser
 * @param source
 *
 * The parser works in coordination with the lexer asking the
 * later next and next token. Analyzing tokens parser descides
 * which procedure of forming an AST node to execute.
 */
function Parser(source) {

  /**
   * @property {Lexer} lexer
   * Our lexer which will provide
   * us with the tokens of the source.
   */
  this.lexer = new Lexer(source);

  /**
   * @property {String} currentToken
   * To keep track of currently read
   * token by the lexer
   */
  this.currentToken = "";

  // init the reader,
  // get the first token
  this.readNextToken();

}

Parser.prototype = {
  constructor: Parser,

  /**
   * readNextToken
   * This one is just a wrapper over the lexer's
   * the same method. This method reads the next
   * token from lexer and saves it into the
   * "currentToken" property.
   */
  readNextToken: function () {
    return this.currentToken = this.lexer.readNextToken();
  },

  /**
   * parseExpressionsRecursively
   * The main function which parses recursively expressions
   * from the stream of tokens provided by the lexer.
   */
  parseExpressionsRecursively: function () {

    /**
     * -- Working with precedence -----
     *
     * As was mentioned, multiplication and division have higher
     * priority than addition and subtraction: 2 + 2 * 2 == 6.
     * It means, that the first action in our expressions parsing
     * should be exactly parsing of the multiplication and only after
     * that -- applying the result to addition. In respect of
     * procedures execution order it means, we first should
     * start parsing the addition (let's call it additiveExpression),
     * and then, already inside it, to parse its LHS and RHS operands as
     * multiplicativeExpression.
     *
     * Example:
     *
     * additiveExpression: LHS + RHS -> 2 + 2 * 2, where:
     * LHS - "2", RHS - "2 * 2". So, we parse both RHS and LHS of the
     * additiveExpression as multiplicativeExpression.
     *
     * Besides. The additiveExpression can contain only RHS (assuming LHS)
     * as 0. For example: 2 * 2 is 2 * 2 + 0.
     */

    // So the parseExpressionsRecursively is just a wrapper
    // for parseAdditiveExpression since it's the main
    // part, i.e. *the lowest* precedence.
    //
    // Grouping operator as we'll see has the *highest* priority:
    // (2 + 2) * 2 is 8. That's why grouping operators is parsed at the end.
    // I.e. the rule is: the lowest precedence nodes are parsed first,
    // and the highest precedence nodes -- last.

    // So let's go down to additiveExpression

    return this.parseAdditiveExpression();

  },

  /**
   * parseAdditiveExpression
   * Parses the additive expression which can be:
   *
   * 1. multiplicativeExpression OR
   * 2. multiplicativeExpression [+ or -] multiplicativeExpression [+ or -] ...
   */
  parseAdditiveExpression: function () {

    // We get the LHS first (which as we said is the
    // multiplicativeExpression; so let's parse it)

    var leftNode = this.parseMultiplicativeExpression();

    // If we have RHS, let's parse it and adjust astNode.
    // If there's nothing on the right, it means we are at the end
    // of the source and should exit. So we try to parse in
    // a loop "while not end of sourse" all RHSs

    while (this.currentToken) {

      // if it's not our operator, then just
      // exit -- only LHS is returned
      if (this.currentToken != "+" && this.currentToken != "-")
        break;

      // get the operator symbol -- the current
      // token, which is either "+" or "-"
      var operatorSymbol = this.currentToken;

      // skip the operator
      this.readNextToken();

      // RHS is also the multiplicativeExpression,
      // so let's parse it too.
      var rightNode = this.parseMultiplicativeExpression();

      // Notice, how "leftNode" recursively becomes child
      // node inside. AST node is now binary, e.g.:
      // ["+", LHS, RHS] -> ["+", ["*", "1", "2"], "3"]
      leftNode = [operatorSymbol, leftNode, rightNode];

    }

    // finaly we return the parsed node
    return leftNode;

  },

  /**
   * parseMultiplicativeExpression
   * Multiplicative expressions is also a binary
   * expression (i.e. it has LHS and optional RHS nodes)
   * and each of its nodes is the baseExpression. I.e.:
   *
   * 1. baseExpression
   * 2. baseExpression [* or /] baseExpression [* or /] baseExpression
   */
  parseMultiplicativeExpression: function () {

    // the code is very similar to parsing
    // additiveExpression: the same we get first LHS
    // and after that analyzise in a loop all RHSs

    var leftNode = this.parseBaseExpression();

    // and analyze the look until we have tokens
    // and the next token is operator

    while (this.currentToken) {

      // if it's not our operator, then just
      // exit -- only LHS is returned
      if (this.currentToken != "*" && this.currentToken != "/")
        break;

        // get the operator symbol -- the current
        // token, which is either "*" or "/"
        var operatorSymbol = this.currentToken;

        // skip the operator
        this.readNextToken();

        // RHS is also the baseExpression
        var rightNode = this.parseBaseExpression();

        // AST node is now binary, e.g.:
        // ["+", LHS, RHS] -> ["+", ["*", "1", "2"], "3"]
        leftNode = [operatorSymbol, leftNode, rightNode];

    }

    // finaly we return the parsed node
    return leftNode;

  },

  /**
   * parseBaseExpression
   * This one parses either numbers
   * of the grouping operators; both
   * are unary expressions.
   */
  parseBaseExpression: function () {

    var astNode;

    // if the current token is a number
    // then we return the number itself
    if (/\d/.test(this.currentToken)) {

      // get the number
      astNode = this.currentToken;

      // and skip it in the stream
      this.readNextToken();

    }

    // else it must be the grouping operator
    // but let's check for consistency
    else if (this.currentToken == "(") {

      // we skip the open parenthesis "("
      this.readNextToken();

      // inside the grouping operator can be (and should be)
      // only some other expression, so let's recursively parse it;
      // it is the result of the AST node
      astNode = this.parseExpressionsRecursively();

      // we should also skip the close parenthesis ")"
      this.readNextToken();

    }

    // and again return the node
    return astNode;

  }

};

/**
 * Parser.parse
 * Static helper method
 */
Parser.parse = function (source) {
  return new Parser(source).parseExpressionsRecursively();
}

// That's it. Let's test our parser.

var ast = Parser.parse("1 + 2");
console.log(ast); // ["+", "1", "2"]

// try to evaluate
console.log(evaluate(ast)); // 3

// more complex programs

console.log(evaluate(Parser.parse("2 + 2 * 2"))); // 6
console.log(evaluate(Parser.parse("(2 + 2) * 2"))); // 8

console.log(evaluate(Parser.parse("(10 - 6) / (0 + 1 * 2)"))); // 2

// This is the only and the last parser we've written in this
// series. You may find more complete example of parsing of
// a small language e.g. in this article (we used a similar format):
// http://blog.tcx.be/2007/05/writing-parser-overview.html
//
// That's said, the process of the interpretation isn't directly
// related with the process of parsing. In the next lessons we'll
// continue to work with ASTs only as our programs, though you may
// write your own parsers from *any* concrete syntax to our AST format.
//
// The parser we've written is known as top-down LL parser.
// http://en.wikipedia.org/wiki/Top-down_parsing
// http://en.wikipedia.org/wiki/LL_parser
//
// We also see that the parsing process is actually laborious process and
// in practice you may want to consider automatic parser generators, such
// as e.g. Jison for JavaScript (see: http://zaach.github.com/jison/). Though,
// hand-written parsers usually give us the ability to control the source
// more effectively and in more human view, showing sensible parse errors.
//
// In fact, we could directly interpret the results when was parsing
// the nodes. However, we underline here, that the parsing process is the
// *intermediate* stage -- before the AST format, and exactly the
// parser allows us to have *different concrete syntaxes* for the *same semantics*.

// Exercises:
//
// 1. parseAdditiveExpression and parseMultiplicativeExpression are
//    very similar. Can we reuse the code making a more compact
//    method? Won't it decrease the readability?
//
// 2. Implement unary "+" and "-" which invert the sign of the numbers.
//
//    Example: evaluate("-2 + 3") -> 1
//
// 3. Experiment with other concrete syntaxes which will compile
//    to the same AST format which we use in the "evalute" function.
//    Both Lexer and Parser should be corrected in this case.
//
