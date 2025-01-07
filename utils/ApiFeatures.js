class ApiFeatures {
  constructor(query, reqQuery) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    const reqQueryCopy = {...this.reqQuery};
    ['page', 'limit', 'sort', 'fields'].forEach(current => delete reqQueryCopy[current])

    let advQueryString = JSON.stringify(reqQueryCopy);
    advQueryString = advQueryString.replace(/(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(advQueryString));
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

  paginate() {
    const limit = this.reqQuery.limit || 5;
    const page = this.reqQuery.page || 1;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  enableSearchByFieldFor(...fieldsArr) {
    fieldsArr.forEach(current => {
      this.query = this.query.find({
        [current]: {$regex: new RegExp(this.reqQuery[current], 'i')}
      })
    });
    /** Since the query params in fieldsArr are already handled in this method,
     * we need to strip these query params from request query object, so that
     * they are not applied again on chaining filter methods
     */
    fieldsArr.forEach(current => delete this.reqQuery[current]);
    return this;
  }
};

module.exports = ApiFeatures;
