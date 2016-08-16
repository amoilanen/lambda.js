import { Interpreter, Variable, Func, Application } from './lib/lambda'

describe('interpreter', () => {

  let interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
  });

  const test = (fixtures) =>
    fixtures.forEach(([expr, expected, comment = '']) => {
      it(`should interpret ${expr} ${comment}`, () => {
        expect(interpreter.eval(expr).toString()).toEqual(expected);
      });
    })

  describe('β-normal form: no further β-reduction is possible', () => {

    test([
      [
        new Variable('x'),
        'x',
        'variable'
      ],
      [
        new Func('x',
          new Variable('y')
        ),
        '(λx.y)', 'function'
      ],
      [
        new Application(
          new Variable('x'),
          new Variable('y')
        ),
        '(xy)', 'application'
      ]
    ]);
  });

  //TODO: One β-reduction remaining
  //TODO: Several β-reductions
  //TODO: Several pathes to do β-reduction
  //TODO: Variable name overshadows a variable from an enclosing context: α-reduction is needed to rename the variables
  //TODO: Evaluate f(Yf):  Y-combinator applied to a function, should be a fixed point
});