//TODO: First parse an expression into a tree of 'Var', 'Func' which both are 'Term's
//then evaluate the resulting tree by using β-reduction, write tests for the parser

const lambda = {
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
}

export default lambda;