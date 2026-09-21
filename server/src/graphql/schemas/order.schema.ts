const orderTypeDefs = `#graphql

  type OrderItem {
    menuItem: MenuItem!
    quantity: Int!
    price: Float!
    specialRequests: String
  }

  type Order {
    id: ID!
    customer: User!
    items: [OrderItem!]!
    totalAmount: Float!
    status: String!
    paymentMethod: String!
    paymentStatus: String!
    stripePaymentIntentId: String
    payAtShopToken: String
    specialInstructions: String
    createdAt: String!
    updatedAt: String!
  }

  input OrderItemInput {
    menuItem: ID!
    quantity: Int!
    specialRequests: String
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    paymentMethod: String!
    specialInstructions: String
  }

  input OrderFilters {
    status: String
    paymentStatus: String
    paymentMethod: String
  }

  type Query {
    getOrders(filters: OrderFilters): [Order!]!
    getMyOrders: [Order!]!
    getOrder(id: ID!): Order
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
    markOrderAsPaid(id: ID!): Order!
    cancelOrder(id: ID!): Order!
  }

`

export default orderTypeDefs