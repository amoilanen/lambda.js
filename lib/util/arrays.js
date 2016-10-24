export const unique = (arr) =>
  Object.keys(
    arr.reduce((acc, element) => {
      if (!acc[element]) {
        acc[element] = true;
      }
      return acc;
    }, {})
  )

export const contains = (arr, element) =>
  arr.indexOf(element) >= 0

export const without = (arr, excluded) =>
  arr.filter(element =>
    !contains(excluded, element)
  )