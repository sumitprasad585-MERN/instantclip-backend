class ApiFeatures {
  constructor(query, reqQuery) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    let reqQueryCopy = {...this.reqQuery};
    ['page', 'sort', 'limit', 'fields'].forEach(current => delete reqQueryCopy[current]);

    let advQueryString = JSON.stringify(reqQueryCopy);
    advQueryString = advQueryString.replace(/(gte|gt|lte|lt)\b/g, match => `$${match}`);
    advQueryString = JSON.parse(advQueryString);

    this.query = this.query.find(advQueryString);

    return this;
  }

  paginate() {
    const page = this.query.page || 1;
    const limit = this.query.limit || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }

    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }

    return this;
  }

  enableSearchByFieldFor(...fieldsArr) {
    fieldsArr.forEach(current => {
      this.query = this.query.find({ [current]: {$regex: new RegExp(this.reqQuery[current], 'i')} });
    });

    fieldsArr.forEach(current => delete this.reqQuery[current]);

    return this;
  }
}

module.exports = ApiFeatures;
