// pvncad's solution to lesson 2 of Essentials of interpretation.
//
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
// Experiment and provide different implementation of the Lexer
// with the same end result.
//
// 3. For more less complex grammars with many tokens, it is good
// to keep track of token types and also represent a token
// not as simply a value, but as e.g. a pair of a type and a value --
// it will make handling of tokens easier in the parser.
// Implement both token types map and tokens constructor correcting
// readers (of digits and symbols) in the lexer.
//
// Example:
//
// var TokenTypes = {digit: 0, simbol: 1};
// function Token(type, value) {...}
// return new Token(TokenTypes.digit, tokenValue);
//

/**
 * @class Reader
 * @param {String} source
 *
 * Reader abstracts out the reading process of source.
 * 
 * It keeps track of current position in the source code and next available
 * character.
 */
function Reader(source)
{
    /**
     * @property source
     * Entire source code in string form.
     */
    this.source = source;

    /**
     * @property cursor
     * To keep track of current position of reading.
     */
    this.cursor = 0;

    /**
     * readNextChar
     * Returns the next character in the source code.
     */
    this.readNextChar = function() {
        if (this.cursor < source.length) {
            this.cursor ++;
            return source[this.cursor - 1];
        }
        return "";
    }
}

/**
 * @class Lexer
 * @param {String} source
 *
 * Lexer tokenizes the input stream and separate
 * from it concrete tokens of our grammer.
 */
function Lexer(source)
{
    /**
     * @property source
     *
     * Reader used to read the source code character by character.
     */
    this.source = new Reader(source);

    this.TokenTypes = { number: 0, operator: 1 };

    this.Token = function(type, value) {
        this.type  = type;
        this.value = value;
    }

    this.Token.prototype.toString = function() {
        return "{" + this.type + ", " + this.value + "}";
    }

    // init current char to first one
    this.currentChar = this.source.readNextChar();
}


Lexer.prototype = {
    
    constructor: Lexer,

    /**
     * readNextToken
     *
     * Reading the next token is quite simple in this interpretator.
     * We have only two type of tokens: number and operators.
     *
     * We analyse the current character and decide which type of token to read.
     */
    readNextToken: function()
    {
        // read all the unused whitespaces
        while(/\s/.test(this.currentChar)) {
            this.currentChar = this.source.readNextChar();
        }

        if (this.currentChar == "") {
            return null;
        }

        if (/\d/.test(this.currentChar)) {
            return this.readNumber();
        }

        return this.readOperator();
    },

    /**
     * readNumber
     * Read the number from the source code.
     */
    readNumber: function()
    {
        var token = "";

        while (/\d/.test(this.currentChar)) {
            token += this.currentChar;
            this.currentChar = this.source.readNextChar();
        }

        if (this.currentChar == ".") {
            token += this.currentChar;
            this.currentChar = this.source.readNextChar();

            while (/\d/.test(this.currentChar)) {
                token += this.currentChar;
                this.currentChar = this.source.readNextChar();
            }
        }
        return new this.Token(this.TokenTypes.number, token);
    },

    readOperator: function() {
        var oper = this.currentChar;
        this.currentChar = this.source.readNextChar();
        return new this.Token(this.TokenTypes.operator, oper);
    }
}

Lexer.tokenize = function(source) {
  var lexer = new Lexer(source);
  var tokens = [];
  
  do {
    tokens.push(lexer.readNextToken());
  } while (lexer.currentChar);

  return tokens;
}

print(Lexer.tokenize("10 + 5"));

print(Lexer.tokenize("(10 + 5) - (4 -1)"));
