class SearchFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        const keyword = this.queryString.keyword
            ? { name: { $regex: this.queryString.keyword, $options: "i" } }
            : {};

        this.query = this.query.find(keyword);
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryString };
        ["keyword", "page", "limit", "sort"].forEach((key) => delete queryCopy[key]);

        let queryString = JSON.stringify(queryCopy);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    sort() {
        const sort = this.queryString.sort;
        if (sort === "price-asc") this.query = this.query.sort({ price: 1 });
        else if (sort === "price-desc") this.query = this.query.sort({ price: -1 });
        else if (sort === "rating") this.query = this.query.sort({ ratings: -1, numOfReviews: -1 });
        else if (sort === "newest") this.query = this.query.sort({ createdAt: -1 });
        else this.query = this.query.sort({ createdAt: -1 });
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Math.max(Number(this.queryString.page) || 1, 1);
        const skipProducts = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skipProducts);
        return this;
    }
}

module.exports = SearchFeatures;
