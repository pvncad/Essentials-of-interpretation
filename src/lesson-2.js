/*
* Essentials of interpretation.
* by Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
*
* Lesson 2. Parsing. Lexer of AE in math infix notation.
*
* As was proposed in the exercise 3 of the previous lesson,
* we could implement a *translator* from the concrete syntax,
* into the abstract syntax (which already is understandable for
* our interpreter). This translator is called a "parser".
*
* We chose here to translate concrete syntax of the
* math infix notation into our AST format:
*
* Example: "1 + 2" -> ["+", "1", "2"]
*
* The parsing process is separated in two stages: scanning and parsing.
*
* The first part of the the process (scanning) isn't related with
* the semantics of our program and even doesn't touch
* the exact grammar. All it does is just separates logical
* syntactic *primitives* from which our grammar consists of.
* These primitive parts are called "tokens".
*
* Tokens are sequences of chars (or a single char). For example, we have
* digit token "115" which consists of three chars "1", "1" and "5".
*
* So our task in this lesson is to separate tokens from the input stream.
* For this we need an object which is called "tokenizer". Another names of
* it are "lexer" or "scanner" (all three are synonyms). So let's implement
* it for our AE grammar.
*
*/

/**
 * @class Lexer
 * @param {String} source
 *
 * Lexer tokenizes the input stream and separate
 * from it concrete tokens of our grammar.
 */
function Lexer(source) {

  /**
   * @property source
   * Keeps the adjusted (without whitespace) input source.
   * Example: " (1 + 2)  +3 " -> "(1+2)+3"
   */
  this.source = source.replace(/\s+/g, "");

  /**
   * @property cursor
   * to track the current position of reading
   */
  this.cursor = 0;

  /**
   * @property currentChar
   * stores the current read char
   */
  this.currentChar = "";

  // init current char to first one
  this.readNextChar();

}

Lexer.prototype = {
  constructor: Lexer,

  /**
   * readNextChar
   * This procedure just reads the next char
   * in the input stream storing it into the
   * "currentChar" instance variable. We also
   * track the position of the cursor and return
   * default empty value in case of the end of the string.
   */
  readNextChar: function () {
    this.currentChar = this.source[this.cursor++] || "";
  },

  /**
   * readNextToken
   * Reading the next token is quite simple
   * in this interpreter: we have only "digits"
   * and "symbols" -- (, ), + and -.
   * We analyze the current char and decide on
   * it which reading procedure to execute.
   */
  readNextToken: function () {

    // if current char is a digit, then
    // execute digits reader
    if (/\d/.test(this.currentChar))
      return this.readDigit();

    // else it must be one of the
    // symbols: parens, + or -
    return this.readSymbol();

    // etc. if we would have more complex grammar;
    // that is reading next tokens is the
    // simplest case analysis procedure

  },

  /**
   * readDigits
   * Tries to read digits starting from the
   * first digit position. Example:
   * Having "9" tries to read number "923"
   */
  readDigit: function () {
    var tokenValue = "";
    while (/\d/.test(this.currentChar)) {
      // collect the digits into a number
      tokenValue += this.currentChar;
      // and moving forward
      this.readNextChar();
    }
    return tokenValue;
  },

  /**
   * readSymbols
   * This procedure is even simpler than
   * reading digits, since here we don't need
   * to read the following chars to get the complete number --
   * all our symbols consist of only one char. So we directly
   * return the "currentChar" as the token itself.
   */
  readSymbol: function () {
    // get token value
    var tokenValue = this.currentChar;
    // move forward to the next char
    this.readNextChar();
    // and return the token
    return tokenValue;
  },

};

/**
 * tokenize
 * @param {String} source
 * Static helper method.
 * This method just gets next and next
 * token in a loop until we reach
 * the end of the source. The result the
 * array of scanned tokens.
 */
Lexer.tokenize = function (source) {
  var lexer = new Lexer(source);
  var tokens = [];
  do {
    tokens.push(lexer.readNextToken());
  } while (lexer.currentChar);
  return tokens;
};

// That's it. We *tokenized* our source code into parts (tokens) which
// understandable for the following part of our parsing process -- the "parser",
// which already will work with these tokens.

// Let's test our tokenizer

// the simplest program with three
// tokens: [digit, symbol, digit]
// Result: ["10", "+", "5"]
console.log(Lexer.tokenize("10 + 5"));

// more complex source
// Result: ["(", "10", "+", "5", ")", "-", "(", "1", "-", "4", ")"]
console.log(Lexer.tokenize("(10 + 5) - (1 - 4)"));

// Exercises:
//
// 1. Encapsulate the text reader into the separate class, abstracting
//    the reading process of the next char. The cursor's position
//    should be handled by this class and should be removed from the Lexer.
//    This abstraction gives us the ability to read the next char from
//    different sources: either from the source string or a file, net, etc.
//
//    Example:
//
//    this.source = new Reader(source);
//    this.currentChar = this.source.read();
//
// 2. Could we handle this exact lexer is easier manner, e.g. using RegExps?
//    Experiment and provide different implementation of the Lexer
//    with the same end result.
//
// 3. For more less complex grammars with many tokens, it is good
//    to keep track of token types and also represent a token
//    not as simply a value, but as e.g. a pair of a type and a value --
//    it will make handling of tokens easier in the parser.
//    Implement both token types map and tokens constructor correcting
//    readers (of digits and symbols) in the lexer.
//
//    Example:
//
//    var TokenTypes = {digit: 0, simbol: 1};
//    function Token(type, value) {...}
//    return new Token(TokenTypes.digit, tokenValue);
//
