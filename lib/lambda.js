//TODO: First parse an expression into a tree of 'Var', 'Func' which both are 'Term's
//then evaluate the resulting tree by using β-reduction, write tests for the parser

class Term {
}

//x
export class Variable extends Term {
  constructor(name) {
    super();
    this.name = name;
  }
}

//λx.x
export class Function extends Term {
  constructor(argument, body) {
    super();
    this.argument = argument;
    this.body = body;
  }
}

//(λx.x)y
export class Application extends Term {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }
}

export const parser = {
  parse: (expr) => {
    return expr;
  }
};

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