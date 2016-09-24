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

  describe('one β-reduction until β-normal form', () => {

    test([
      [
        new Application(
          new Func('x',
            new Variable('y')
          ),
          new Variable('z')
        ),
        'y', 'body of the function is a free variable'
      ],
      [
        new Application(
          new Func('x',
            new Variable('x')
          ),
          new Variable('z')
        ),
        'z', 'identity function'
      ],
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('x'),
              new Variable('y')
            )
          ),
          new Variable('y')
        ),
        '(yy)', 'body of the function is an application'
      ],
      [
        new Application(
          new Func('x',
            new Func('y',
              new Application(
                new Variable('y'),
                new Variable('x')
              )
            )
          ),
          new Variable('z')
        ),
        '(λy.(yz))', 'body of the function is a function'
      ],
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('y'),
              new Variable('x')
            )
          ),
          new Func('t',
            new Variable('t')
          )
        ),
        '(y(λt.t))', 'argument is a function'
      ],
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('y'),
              new Variable('x')
            )
          ),
          new Application(
            new Variable('f'),
            new Variable('g')
          )
        ),
        '(y(fg))', 'argument is an application'
      ],
      [
        new Application(
          new Func('x',
            new Func('y',
              new Func('z',
                new Variable('x')
              )
            )
          ),
          new Func('t',
            new Variable('g')
          )
        ),
        '(λy.(λz.(λt.g)))', 'body is a deeply nested expression, argument a function'
      ],
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('z'),
              new Func('y',
                new Application(
                  new Variable('h'),
                  new Func('z',
                    new Variable('x')
                  )
                )
              )
            )
          ),
          new Func('t',
            new Variable('g')
          )
        ),
        '(z(λy.(h(λz.(λt.g)))))', 'body contains nested applications, argument a function'
      ],
      [
        new Application(
          new Func('x',
            new Variable('x')
          ),
          new Func('x',
            new Variable('x')
          )
        ),
        '(λx.x)', 'identity applied to identity reduces to identity'
      ]
    ]);
  });

  describe('several β-reductions', () => {

    test([
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('x'),
              new Variable('y')
            )
          ),
          new Func('t',
            new Variable('t')
          )
        ),
        'y', 'several β-reductions'
      ],
      [
        new Application(
          new Func('x',
            new Variable('y')
          ),
          new Application(
            new Func('x',
              new Application(
                new Variable('x'),
                new Variable('x')
              )
            ),
            new Func('x',
              new Application(
                new Variable('x'),
                new Variable('x')
              )
            )
          )
        ),
        'y', 'several pathes to do β-reduction, leftmost redex is reduced first'
      ],
      [
        new Application(
          new Application(
            new Func('x',
              new Func('y',
                new Variable('x')
              )
            ),
            new Func('x',
              new Variable('x')
            )
          ),
          new Application(
            new Func('x',
              new Application(
                new Variable('x'),
                new Variable('x')
              )
            ),
            new Func('x',
              new Application(
                new Variable('x'),
                new Variable('x')
              )
            )
          )
        ),
        '(λx.x)', 'several pathes to do β-reduction, several β-reductions, leftmost redex is reduced first'
      ],
      [
        new Application(
          new Application(
            new Func('x',
              new Func('y',
                new Variable('x')
              )
            ),
            new Func('x',
              new Variable('x')
            )
          ),
          new Func('x',
            new Application(
              new Variable('x'),
              new Variable('x')
            )
          )
        ),
        '(λx.x)', 'two reductions to identity'
      ]
    ]);
  });

  describe('infinite loop detection', () => {

    it(`should detect`, () => {
      const expr = new Application(
        new Func('x',
          new Application(
            new Variable('x'),
            new Variable('x')
          )
        ),
        new Func('x',
          new Application(
            new Variable('x'),
            new Variable('x')
          )
        )
      );
      const errorMessage = 'Potential infinite loop detected while evaluating ((λx.(xx))(λx.(xx))), aborting...';

      expect(() => interpreter.eval(expr)).toThrowError(errorMessage);
    });

    describe('several reductions before going into loop', () => {

      it(`should detect`, () => {
        const expr = new Application(
          new Application(
            new Func('x',
              new Func('y',
                new Variable('x')
              )
            ),
            new Application(
              new Func('x',
                new Application(
                  new Variable('x'),
                  new Variable('x')
                )
              ),
              new Func('x',
                new Application(
                  new Variable('x'),
                  new Variable('x')
                )
              )
            )
          ),
          new Func('x',
            new Variable('x')
          )
        );
        const errorMessage = 'Potential infinite loop detected while evaluating (((λx.(λy.x))((λx.(xx))(λx.(xx))))(λx.x)), aborting...';

        expect(() => interpreter.eval(expr)).toThrowError(errorMessage);
      });
    });
  });

  describe('α-reduction, ensuring freedome of substitution', () => {

    test([
      [
        new Application(
          new Func('y',
            new Func('x',
              new Application(
                new Variable('y'),
                new Variable('x')
              )
            )
          ),
          new Variable('x')
        ),
        '(λt_0.(xt_0))', 'same variable is both free and bound' //(λy.(λx.yx))x
      ],
      [
        new Application(
          new Func('x',
            new Application(
              new Variable('x'),
              new Func('x',
                new Variable('x')
              )
            )
          ),
          new Variable('y')
        ),
        '(y(λt_0.t_0))', 'function argument is both free and bound in a function body' //(λx.x(λx.x))y
      ],
      [
        new Application(
          new Func('x',
            new Func('x',
              new Func('x',
                new Func('x',
                  new Variable('x')
                )
              )
            )
          ),
          new Variable('y')
        ),
        '(λt_0.(λt_1.(λt_2.t_2)))', 'variable is rebound in a chain of nested functions' //(λx.(λx.(λx.(λx.x))))y
      ],
      [
        new Application(
          new Func('y',
            new Func('x',
              new Application(
                new Variable('x'),
                new Variable('y')
              )
            )
          ),
          new Func('z',
            new Application(
              new Variable('z'),
              new Variable('x')
            )
          )
        ),
        '(λt_0.t_0((λz.(zx))))', 'same variable is both free in a function and bound in another function ' //(λy.(λx.xy))(λz.zx)
      ]
    ]);
  });

  //TODO: Also store the history of evaluation
  //TODO: Evaluate f(Yf) one reduction and Yf two reductions:  Y-combinator applied to a function, should reduce to the same term
});