import { Variable } from 'terms/variable'
import { Func } from 'terms/function'
import { Application } from 'terms/application'

const getPadding = depth => {
  let result = '';
  for(let i = 0; i < depth; i++) {
    result += '  ';
  }
  return result;
}

export class Generator {

  eval(term, depth=0) {
    if (term instanceof Variable) {
      return this.evalVariable(term);
    } else if (term instanceof Func) {
      return this.evalFunction(term, depth);
    } else if (term instanceof Application) {
      return this.evalApplication(term, depth);
    }
    return '';
  }

  evalVariable(term) {
    return term.name;
  }

  evalFunction(term, depth) {
    const padding = getPadding(depth);

    return `function(${term.argument}) {
${padding}  return ${this.eval(term.body, depth + 1)};
${padding}}`
  }

  evalApplication(term, depth) {
    const leftExpression = (term.left instanceof Variable)
      ? this.evalVariable(term.left)
      : `(${this.eval(term.left, depth)})`

    return `${leftExpression}(${this.eval(term.right, depth)})`;
  }
}