const categoryTypeDefs=`#graphql 

type Category {
    id: ID!
    name: String!
    description: String
    image: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
} 
input CreateCategoryInput{
    name: String!
    description: String
    image: String
} 
input UpdateCategoryInput {
    name: String
    description: String
    image: String
    isActive: Boolean
}


type Query {
    getCategories: [Category!]!
    getCategory(id: ID!): Category
}

type Mutation {
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
}
`
export default categoryTypeDefs