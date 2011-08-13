/*
 * Essentials of interpretation.
 * by Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 *
 * Lesson 1. The simplest arithmetic expressions (AE) evaluator.
 *
 * We use BNF (Backus-Naur Form) grammar to represent our language:
 *
 * <AE> ::= <num>
 * | ["+" <AE> <AE>]
 * | ["-" <AE> <AE>]
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

// Exercises:
//
// 1. Implement multiplication and division
//
// 2. Encapsulate and improve handling of similar
// expression types in "eval" reusing the code by getting
// the type and running needed evaluator by dynamic name:
// E.g.:
// var expressionType = getType(exp);
// return this["evaluate" + expressionType](exp);


/**
 * evaluate
 * @param {Program} exp
 * Case analysis of the expression.
 *
 * "eval" accepts expression to evaluate
 * and depending on the expression's type
 * executes appropriate evaluating procedure
 */
function evaluate(exp)
{
    if (isNum(exp)) {
        return +exp;
    }

    var f = func(exp[0]) ;

    if (f != null) {
        var a = evaluate(exp[1]);
        var b = evaluate(exp[2]);
        return f(a, b);
    }

    return null;
}

/**
 * isNum
 * @param {Token} exp 
 */ 
function isNum(exp)
{
    return !isNaN(+exp);
}

/**
 * func
 */
function func(op)
{
    var f = new Array();

    f["+"] = function(a, b) { return a + b };
    f["-"] = function(a, b) { return a - b };
    f["*"] = function(a, b) { return a * b };
    f["/"] = function(a, b) { return a / b };
    f["^"] = function(a, b) { return a ^ b };
    f["%"] = function(a, b) { return a % b };
    return f[op];
}

var ds = {
    stack : 
        function() {
            var elements;
            this.push = function(element) {
                if (typeof(elements) === 'undefined') {
                    elements = [];
                }
                elements.push(element);
            }

            this.pop = function() {
                return elements.pop();
            }

            this.top = function() {
                if (typeof(elements) == 'undefined' ||
                    elements.length == 0)
                    return null;
                return elements[elements.length - 1];
            }

            this.items = function() {
                return elements;
            }
        }
}


//
// 3. Write a parser which translates concrete syntax to AST.
// Chose any concrete syntax, e.g. infix math notation:
// 1 + 3 -> ["+", "1", "3"].
//
var infix_parser = function () {
    /**
     * Supported operators and their associations and
     * precedence.
     */
    var _operators  = { '+': '2L', '-': '2L', '*': '3L',
                       '/': '3L', '%': '3L' , '^': '4R'};
   /**
    * Tokenizer method - returns a generator producing tokens
    * out of given expression string.
    */
   this._tokenizer = function(expr) {

       for (var i = 0; i < expr.length; i ++)
       {
           var ch = expr.charAt(i);
           if (ch == ' ') {
               continue;
           }

           if (ch in _operators || ch == ')' || ch == '(') {
               yield ch;
               continue;
           }

           var seen = false
           var token = "";

           // Should a number. Supports floating point numbers
           while((ch >= '0' && ch <= '9') || (!seen && ch == '.'))
           {
               token += ch;

               if (ch == '.') {
                   seen = true;
               }

               i  ++;

               if (i == expr.length) {
                   yield token;
                   return; 
               }

               ch = expr.charAt(i);
           }

           i --;

           yield token;
       }
   }

   /**
    * Returns true if op2 is of lower precedence over op1.
    */
   this._op_compare = function (op1, op2) {
        if (op2 == null) {
            return false;
        }

        return (_operators[op1][1] == 'L' && _operators[op1][0] <= _operators[op2][0]) ||
               (_operators[op1][1] == 'R' && _operators[op1][0] <  _operators[op2][0]);
   }

   /**
    * Returns the prefix tree for the given expression.
    *
    * e.g. "1 + 2" => [ "+", "1", "2" ]
    *      "1 + 2 * 3 + 4 => [ "+", 
    *                               "1",
    *                               
    *                               [ "+",
    *                                      [ "*", "2", "3"],
    *                                      "4"
    *                               ] 
    *                        ] 
    */
   this.convert = function(expr) {
       var token_gen = this._tokenizer(expr);
    
       var opers    = new ds.stack();
       var operands = new ds.stack();

       var opr1, opr2, op;
       for (var token in token_gen) {
            if (token == '(') {
                opers.push(token);
            }
            else if (token == ')') {
                op = opers.pop();
                while (op != "(") {
                    opr1 = operands.pop();
                    opr2 = operands.pop();
                    operands.push([op, opr2, opr1]);
                    op = opers.pop();
                }
            }
            else if (token in _operators) {
                op = opers.top();
                while (op in _operators &&
                       this._op_compare(token, op))
                {
                    opr1 = operands.pop();
                    opr2 = operands.pop();
                    operands.push([opers.pop(), opr2, opr1]);
                    op = opers.top();
                }
                opers.push(token);
            }
            else {
                operands.push(token);
            }
       }

       op = opers.top();

       while (op != null) {
           opr1 = operands.pop();
           opr2 = operands.pop();
           operands.push([opers.pop(), opr2, opr1]);
           op = opers.top();
       }

       return operands.pop();
   }
}

var parser = new infix_parser();

// the simplest addition
print(evaluate(parser.convert("1 + 3")));
print(evaluate(parser.convert("1 + 2 * 3 + 4")));
print(evaluate(parser.convert("1 + (2 * 3) + 9 - 3")));
