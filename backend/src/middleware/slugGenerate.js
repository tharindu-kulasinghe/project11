

export const slugGenerate = vehicleSchema.pre('save', async function (next) {

    function generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .trim()
    }

    if (this.isModified('title') || this.isNew) {
        let slug = generateSlug(this.title)
        let counter = 1
        let originalSlug = slug

        while (await mongoose.models.Vehicle.findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${originalSlug}-${counter}`
            counter++
        }

        this.slug = slug
    }
    next()
})