

const menuTypeDefs = `#graphql
type MenuItem {
    id: ID!
    name: String!                                  
    description: String
    price: Float!
    image: String
    category: ID!
    isAvailable: Boolean!
    isVegetarian: Boolean!                         
    isVegan: Boolean!
    isGlutenFree: Boolean!
    preparationTime: Int
    createdAt: String!
    updatedAt: String!
}

input CreateMenuItemInput {
    name: String!
    description: String
    price: Float!
    image: String
    category: ID!
    isVegetarian: Boolean!
    isVegan: Boolean!
    isGlutenFree: Boolean!
    preparationTime: Int
}

input UpdateMenuItemInput{
    name: String
    description: String
    price: Float
    image: String
    category: ID
    isAvailable: Boolean
    isVegetarian: Boolean
    isVegan: Boolean
    isGlutenFree: Boolean
    preparationTime: Int
}

input MenuItemFilters {
  category: ID
  isAvailable: Boolean
  isVegetarian: Boolean
  isVegan: Boolean
  isGlutenFree: Boolean
}
type Query {
    getMenuItems(filters: MenuItemFilters): [MenuItem!]!
    getMenuItem(id: ID!): MenuItem
  }
type Mutation {
    createMenuItem(input: CreateMenuItemInput): MenuItem!
    updateMenuItem(id: ID!, input: UpdateMenuItemInput!): MenuItem!
    deleteMenuItem(id: ID!): Boolean!
}


`

export default menuTypeDefs 