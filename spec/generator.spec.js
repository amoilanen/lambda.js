import { Generator } from 'generators/js/generator'
import { Variable } from 'terms/variable'
import { Func } from 'terms/function'
import { Application } from 'terms/application'

describe('generator', () => {

  let generator;

  beforeEach(() => {
    generator = new Generator();
  });

  const test = fixtures =>
    fixtures.forEach(([expr, expected, comment = '']) => {
      it(`should generate code for ${expr} ${comment}`, () => {
        expect(generator.eval(expr).toString()).toEqual(expected);
      });
    })

  describe('simple term', () => {
    test([
      [
        new Variable('x'),
`x`,
        'variable'
      ],
      [
        new Func('x', new Variable('y')),
`function(x) {
  return y;
}`,
        'function'
      ],
      [
        new Application(
          new Func('x', new Variable('y')),
          new Variable('z')
        ),
`(function(x) {
  return y;
})(z)`,
        'application'
      ],
      [
        new Func('f',
          new Application(
            new Func('x',
              new Application(
                new Variable('f'),
                new Application(
                  new Variable('x'),
                  new Variable('x')
                )
              )
            ),
            new Func('x',
              new Application(
                new Variable('f'),
                new Application(
                  new Variable('x'),
                  new Variable('x')
                )
              )
            )
          )
        ),
`function(f) {
  return (function(x) {
    return f(x(x));
  })(function(x) {
    return f(x(x));
  });
}`,
        'Y-combinator'
      ]
    ]);
  });
});

//TODO: Turing fixed point combinator Θ = (λxy.y((xx)y))(λxy.y((xx)y))