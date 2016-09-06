class Term {

  setParent(parentTerm) {
    this.parentTerm = parentTerm;
    return this;
  }
}

//x
export class Variable extends Term {
  constructor(name) {
    super();
    this.name = name;
  }

  substitute(variableName, term) {
    if (variableName === this.name) {
      return term;
    } else {
      return this;
    }
  }

  findLeftMostRedex() {
    return null;
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
    this.body = body.setParent(this);
  }

  apply(term) {
    return this.body.substitute(this.argument, term);
  }

  substitute(variableName, term) {
    return new Func(
      this.argument,
      this.body.substitute(variableName, term)
    );
  }

  findLeftMostRedex() {
    return this.body.findLeftMostRedex();
  }

  toString() {
    return `(λ${this.argument}.${this.body})`;
  }
}

//(λx.x)y
export class Application extends Term {
  constructor(left, right) {
    super();
    this.left = left.setParent(this);
    this.right = right.setParent(this);
  }

  reduce() {
    if (this.left instanceof Func) {
      return this.left.apply(this.right).setParent(this.parentTerm);
    } else {
      return this;
    }
  }

  findLeftMostRedex() {
    let leftMostRedex;

    if (this.left instanceof Func) {
      leftMostRedex = this;
    }

    if (!leftMostRedex) {
      leftMostRedex = this.left.findLeftMostRedex() || this.right.findLeftMostRedex();
    }

    return leftMostRedex;
  }

  substitute(variableName, term) {
    return new Application(
      this.left.substitute(variableName, term),
      this.right.substitute(variableName, term)
    );
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
      } else if (hasOpeningBracket) {

        //Do not consume bracket from an enclosing expression: hasOpeningBracket is false
        this.brackets.pop();
        parseResult.position = parseResult.position + 1; //consume closing ')'
      }
    }

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

    /*
     * Eagerly parse the expression to the right until
     * a closing bracket of an enclosing expression has been encountered.
     */
    if (parseResult.position != expr.length
      && (expr[parseResult.position] != ')')) {
      parseResult = this.parseApplication(expr, parseResult.position, parseResult.term);
      if (expr[parseResult.position] == ')') {
        handleClosingBracket();
      }
    }

    return parseResult;
  }

  parseVariableOrFunction(expr, position) {
    let parseResult = {
      term: null,
      position: position
    };
    const ch = expr[position];

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

const MAX_REDUCTIONS = 10000;

export class Interpreter {

  /**
   * Reducing the leftmost redex first means that the normal form of a lambda expression is always found if it exists
   * according to the "Normalization Theorem".
   * 
   * This is different from a typical Lisp implementation where arguments are always evaluated first before the function itself is evaluated.
   */
  eval(term) {
    let reductionCount = 0;
    let leftMostRedex = term.findLeftMostRedex();

    //TODO: Re-factor
    while(leftMostRedex && (reductionCount <= MAX_REDUCTIONS)) {
      const reducedLeftMostRedex = leftMostRedex.reduce();
      const leftMostRedexParentTerm = leftMostRedex.parentTerm;

      if (leftMostRedex.parentTerm) {
        if (leftMostRedex.parentTerm.left === leftMostRedex) {
          leftMostRedex.parentTerm.left = reducedLeftMostRedex;
        } else if (leftMostRedex.parentTerm.right === leftMostRedex) {
          leftMostRedex.parentTerm.right = reducedLeftMostRedex;
        } else if (leftMostRedex.parentTerm.body === leftMostRedex) {
          leftMostRedex.parentTerm.body = reducedLeftMostRedex;
        }
      } else if (leftMostRedex === term) {
        //Redex is the root term
        term = reducedLeftMostRedex;
      }
      reductionCount++;
      leftMostRedex = term.findLeftMostRedex();
    }
    if (reductionCount > MAX_REDUCTIONS) {
      throw new Error(`Potential infinite loop detected while evaluating ${term}, aborting...`);
    }
    return term;
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