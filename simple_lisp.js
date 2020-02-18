const simpleLisp = {
  library: {
    car: (x) => {
      return x[0][0] ? x[0][0] : [];
    },

    cdr: (x) => {
      return x[0].slice(1);
    },

    cons: (x) => {
      if (Array.isArray(x[0])) {
        return x.reduce((acc, val) => [...acc, ...val]);
      } else {
        let tail = x.slice(1)
        const newTail = tail.reduce((acc, val) => [...acc, ...val])
        newTail.unshift(x[0]);
        return newTail;
      }
    },

    print: (x) => {
      if (Array.isArray(x)) {
        return x[0];
      }
      return x;
    },

    //Math
    '+': (x) => {
      if (x[0].type === 'number' && x[1].type === 'number') {
        return {
          type: 'number',
          value: x[0].value + x[1].value
        };
      }
      return null;
    },

    '-': (x) => {
      if (x[0].type === 'number' && x[1].type === 'number') {
        return {
          type: 'number',
          value: x[0].value - x[1].value
        };
      }
      return null;
    },

    '*': (x) => {
      if (x[0].type === 'number' && x[1].type === 'number') {
        return {
          type: 'number',
          value: x[0].value * x[1].value
        };
      }
      return null;
    },

    '/': (x) => {
      if (x[0].type === 'number' && x[1].type === 'number') {
        return {
          type: 'number',
          value: x[0].value / x[1].value
        };
      }
      return null;
    },
  },

  replaceAll(func, params, inputs) {
    return func.map(f => {
      if (Array.isArray(f)) {
        return this.replaceAll(f, params, inputs);
      } else {
        params.forEach((p, index) => {
          if (f.type === 'identifier' && f.value === p.value) {
            f = inputs[0][index];
          }
        })
        return f;
      }
    })
  },

  addToLibrary(name, params, func) {
    return this.library[name.value] = (...inputs) => {
      const _params = params;
      let _func = func;
      _func = this.replaceAll(_func, params, inputs);
      return this.interpret(_func);
    }
  },

  resolve(inputs) {
    if (inputs.length > 0 && inputs[0].type === 'identifier') {
      const res = inputs.slice(1).map(t => {
        if (Array.isArray(t) && t.length > 0 && t[0].type === 'identifier') {
          return this.resolve(t)
        } else {
          return t;
        }
      })
      if (inputs.length > 0 && inputs[0].value in this.library) {
        return this.library[inputs[0].value](res);
      } else {
        return res;
      }
    } else {
      return inputs;
    }
  },

  interpretList(input) {
    if (input.length === 4 && input[0].value === 'defun') {
      this.addToLibrary(input[1], input[2], input[3]);
      return undefined;
    } else {
      return this.resolve(input);
    }
  },

  interpret(input) {
    if (input instanceof Array) {
      return this.interpretList(input);
    } else if (input.type === "identifier") {
      return this.library[input.value];
    } else if (input.type === "number" || input.type === "string") {
      return input.value;
    }
  },

  categorize(input) {
    if (!isNaN(parseFloat(input))) {
      return {
        type: 'number',
        value: parseFloat(input)
      };
    } else if (input[0] === '"' && input.slice(-1) === '"') {
      return {
        type: 'string',
        value: input.slice(1, -1)
      };
    } else {
      return {
        type: 'identifier',
        value: input
      };
    }
  },

  parenthesize(input, list) {
    if (list === undefined) {
      return this.parenthesize(input, []);
    } else {
      const token = input.shift();
      if (token === undefined) {
        return list.pop();
      } else if (token === "(") {
        list.push(this.parenthesize(input, []));
        return this.parenthesize(input, list);
      } else if (token === ")") {
        return list;
      } else {
        return this.parenthesize(input, list.concat(this.categorize(token)));
      }
    }
  },

  tokenize(input) {
    return input.split('"')
      .map((x, i) => {
        if (i % 2 === 0) {
          return x.replace(/\(/g, ' ( ')
            .replace(/\)/g, ' ) ');
        } else {
          return x.replace(/ /g, "!whitespace!");
        }
      })
      .join('"')
      .trim()
      .split(/\s+/)
      .map((x) => {
        return x.replace(/!whitespace!/g, " ");
      });
  },

  sentenceSplit(input) {
    let count = 0;
    let flag = false;
    let res = [];
    let start = 0;
    for (let i = 0; i < input.length; i++) {
      if (!count && flag) {
        res.push(input.slice(start, i));
        start = i;
        flag = !flag;
      }
      if (input[i] === '(') count++;
      if (input[i] === ')') count--;
      if (!count) flag = !flag;
    }
    if (start < input.length) res.push(input.slice(start));
    return res;
  },

  parse(input) {
    return this.parenthesize(this.tokenize(input));
  },

  execute(input) {
    let res = [];
    if (input.match(/[^"]?\(.*\)[^"]/gm)) {
      this.sentenceSplit(input).forEach(sentence => {
        const temp = this.interpret(this.parse(sentence))
        if (temp !== undefined) {
          res.push(temp);
        }
      })
    } else {
      res = this.interpret(this.parse(input))
    }
    if (res.length === 1) {
      res = res[0];
    }
    if (res instanceof Array) {
      return res.map(x => x.value ? x.value : x);
    } else {
      return res.value ? res.value : res;
    }
  }
};

console.log(simpleLisp.execute('(defun name(x y) (cons (car x) (cdr y)))(name (1 2 3) (4 5 6))'))
console.log(simpleLisp.execute('(cons (car (1 2 3)) (cdr (4 5 6)))'))

module.exports = {
  simpleLisp
};