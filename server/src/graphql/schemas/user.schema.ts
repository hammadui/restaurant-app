const userTypeDefs = `#graphql 

    type User {
        id: ID!
        name: String!
        email: String!
        role: String!
        phone: String!
        createdAt: String!
        updatedAt: String!
    }

    type AuthPayload {
        token: String!
        user:User!
    }

    input RegisterInput {
        name: String!
        email: String!
        password: String!
        phone: String
    }

    input LoginInput{
        email: String!
        password: String!
    }
    input UpdateProfileInput {
        name: String
        phone: String
  }

    type Query {
        me: User
        getUser(id:ID!): User
        getAllUsers: [User!]!
    }

    type Mutation {
        register(input: RegisterInput!): AuthPayload!
        login(input: LoginInput!): AuthPayload!
        updateProfile(input: UpdateProfileInput!): User!
        deleteUser(id: ID!): Boolean!
    }
`

export default userTypeDefs;