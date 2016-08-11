//TODO: First parse an expression into a tree of 'Var', 'Func' which both are 'Term's
//then evaluate the resulting tree by using β-reduction, write tests for the parser and evaluator

class Term {
}

//x
export class Variable extends Term {
  constructor(name) {
    super();
    this.name = name;
  }

  toString() {
    return this.name;
  }
}

//λx.x
export class Func extends Term {
  constructor(argument, body) {
    super();
    this.argument = argument;
    this.body = body;
  }

  toString() {
    return `(λ${this.argument}.${this.body})`;
  }
}

//(λx.x)y
export class Application extends Term {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  toString() {
    return `(${this.left}${this.right})`;
  }
}

const SPECIAL_SYMBOLS = 'λ.()';
const debug = false;

const log = (...args) => {
  if (debug) {
    console.log.apply(console, args);
  }
}

export class Parser {

  constructor() {
    this.brackets = [];
  }

  isLetter(ch) {
    return ch >= 'a' && ch <= "z";
  }

  isKnownSymbol(ch) {
    return (SPECIAL_SYMBOLS.indexOf(ch) >= 0) || this.isLetter(ch);
  }

  parse(expr) {
    this.brackets = [];
    const parseResult = this.parseExpression(expr, 0);

    if (this.brackets.length > 0) {
      throw `Missing closing parenthesis in '${expr}' at position ${parseResult.position}`;
    }
    return parseResult.term;
  }

  /*
   * Expression -> (Expression) | Function | Variable | Application
   * Function -> λVariable.Expression
   * Variable -> x
   * Application -> ExpressionExpression
   */
  parseExpression(expr, position) {
    log('parseExpression', expr, position);
    if (position === expr.length) {
      throw `Empty expression is not expected at position ${position}`;
    }

    const ch = expr[position];
    let parseResult = {
      term: null,
      position: position
    };
    let hasOpeningBracket = false;

    const handleOpeningBracket = () => {
      hasOpeningBracket = true;
      this.brackets.push('(');
    }
    const handleClosingBracket = () => {
      if (this.brackets.length === 0) {
        throw `Unmatched closing parenthesis in '${expr}' at position ${parseResult.position + 1}`;
      }

      //Do not consume bracket from an enclosing expression: hasOpeningBracket is false
      if ((this.brackets[this.brackets.length - 1] === '(') && hasOpeningBracket) {
        this.brackets.pop();
        parseResult.position = parseResult.position + 1; //consume closing ')'
        return true;
      }
      return false;
    }

    if ((ch === 'λ') || (this.isLetter(ch))) {
      parseResult = this.parseVariableOrFunction(expr, position);
    } else if (ch === '(') {

      /*
       * Expression in brackets
       */
      handleOpeningBracket();
      parseResult = this.parseExpression(expr, position + 1);
    } else if (!this.isKnownSymbol(ch)) {
      throw `Unknown symbol '${ch}' at position ${parseResult.position}`;
    }

    if (expr[parseResult.position] == ')') {
      handleClosingBracket();
    }

    let terms = [];
    terms.push(parseResult.term);

    /*
     * Eagerly parse the expression to the right until
     * a closing bracket of an enclosing expression has been encountered.
     */
    while (parseResult.position != expr.length
      && (expr[parseResult.position] != ')')) {

      parseResult = this.parseVariableOrFunction(expr, parseResult.position);
      if (parseResult.term === null) {
        parseResult = this.parseExpression(expr, parseResult.position);
      }
      terms.push(parseResult.term);

      if (expr[parseResult.position] == ')') {
        handleClosingBracket();
      }
    }
    if (terms.length > 1) {
      parseResult.term = terms.reduce((acc, term) => new Application(acc, term));
    }

    return parseResult;
  }

  parseVariableOrFunction(expr, position) {
    let parseResult = {
      term: null,
      position: position
    };
    const ch = expr[position];

    if (ch === 'λ') {

      /*
       * Function
       */
      parseResult = this.parseFunction(expr, position + 1);
    } else if (this.isLetter(ch)) {

      /*
       * Variable
       */
      parseResult = this.parseVariable(expr, position);
    }

    return parseResult;
  }

  parseVariable(expr, position) {
    log('parseVariable', expr, position);
    const ch = expr[position];
    const term = new Variable(ch);
    const newPosition = position + 1;

    return {term, position: newPosition};
  }

  parseFunction(expr, position) {
    log('parseFunction', expr, position);
    let ch = expr[position];
    let newPosition = position;
    while (ch != '.' && ch != ')' && (newPosition < expr.length)) {
      newPosition++;
      ch = expr[newPosition];
    }
    const hasEmptyBody = expr[newPosition + 1] === ')' || newPosition === expr.length; 
    if ((ch != '.')) {
      throw `Incomplete function definition at position ${newPosition}`;
    }
    if (hasEmptyBody) {
      throw `Empty expression is not expected at position ${newPosition + 1}`;
    }
    const argument = expr.substring(position, newPosition);
    const {term: bodyTerm, position: bodyPosition} = this.parseExpression(expr, newPosition + 1);

    const term = new Func(argument, bodyTerm);

    return {term, position: bodyPosition};
  }

  parseApplication(expr, leftPosition, leftTerm) {
    log('parseApplication', expr, leftPosition);
    const parseResult = this.parseExpression(expr, leftPosition);
    const rightTerm = parseResult.term;
    const rightTermEnd = parseResult.position;
    const term = new Application(leftTerm, rightTerm);

    return {term, position: rightTermEnd};
  }
}

export const lambda = {
  eval: (expr) => {
    const applicationMatch = expr.match(/\(λ(.*)+\.(.*)\)(.*)/);
    if (applicationMatch) {
      const variable = applicationMatch[1];
      const body = applicationMatch[2];
      const argument = applicationMatch[3];

      return argument ? body.replace(new RegExp(variable, 'g'), argument)
        : expr;
    } else {
      return expr;
    }
  },
  apply: (expr) => expr
};