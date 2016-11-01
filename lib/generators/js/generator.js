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
      const padding = getPadding(depth);
      if (term instanceof Variable) {
        return term.name;
      } else if (term instanceof Func) {
        return `function(${term.argument}) {
${padding}  return ${this.eval(term.body, depth + 1)};
${padding}}`
      } else if (term instanceof Application) {
        return `(${this.eval(term.left, depth)})(${this.eval(term.right, depth)})`;
      }
      return '';
    }
}