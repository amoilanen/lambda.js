import { Variable } from 'terms/variable'
import { Func } from 'terms/function'
import { Application } from 'terms/application'

export class Generator {

    eval(term) {
      if (term instanceof Variable) {
        return term.name;
      } else if (term instanceof Func) {
        return `function(${term.argument}) {
  return ${this.eval(term.body)};
}`
      } else if (term instanceof Application) {
        return `(${this.eval(term.left)})(${this.eval(term.right)})`;
      }
      return '';
    }
}