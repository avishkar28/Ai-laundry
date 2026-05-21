/**
 * Database Migration/Initialization Script
 * Run with: node migrate.js
 */

const sequelize = require('./config');
const {
  Customer,
  Order,
  OrderItem,
  Staff,
  StaffAssignment,
  WorkflowHistory
} = require('./models');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Sync models (creates tables if they don't exist)
    console.log('📝 Creating/updating tables...');
    await sequelize.sync({ alter: false }); // Set to true to alter tables
    console.log('✅ Tables synchronized');

    // Seed initial data
    console.log('🌱 Seeding initial data...');
    await seedData();

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function seedData() {
  try {
    // Check if data already exists
    const customerCount = await Customer.count();
    if (customerCount > 0) {
      console.log('⏭️  Data already exists, skipping seed');
      return;
    }

    // Create customers
    const customers = await Customer.bulkCreate([
      {
        name: 'Rahul Sharma',
        phone: '9876543210',
        email: 'rahul@example.com',
        address: '123 MG Road, Apt 501',
        city: 'Bangalore',
        pincode: '560001'
      },
      {
        name: 'Priya Singh',
        phone: '8765432109',
        email: 'priya@example.com',
        address: '456 Brigade Road',
        city: 'Bangalore',
        pincode: '560002'
      },
      {
        name: 'Amit Kumar',
        phone: '7654321098',
        email: 'amit@example.com',
        address: '789 Koramangala Street',
        city: 'Bangalore',
        pincode: '560034'
      },
      {
        name: 'Anita Reddy',
        phone: '6543210987',
        email: 'anita@example.com',
        address: '321 Whitefield Area',
        city: 'Bangalore',
        pincode: '560066'
      },
      {
        name: 'Sneha Patel',
        phone: '5432109876',
        email: 'sneha@example.com',
        address: '654 JP Nagar Road',
        city: 'Bangalore',
        pincode: '560078'
      }
    ]);
    console.log(`✅ Created ${customers.length} customers`);

    // Create staff
    const staff = await Staff.bulkCreate([
      {
        name: 'Ramesh Kumar',
        phone: '9001234567',
        email: 'ramesh@freshfold.com',
        role: 'driver',
        performanceScore: 95.5,
        status: 'active',
        assignedArea: 'Indiranagar'
      },
      {
        name: 'Suresh Patel',
        phone: '9001234568',
        email: 'suresh@freshfold.com',
        role: 'driver',
        performanceScore: 92.0,
        status: 'active',
        assignedArea: 'Koramangala'
      },
      {
        name: 'Anil Sharma',
        phone: '9001234569',
        email: 'anil@freshfold.com',
        role: 'driver',
        performanceScore: 88.5,
        status: 'active',
        assignedArea: 'HSR Layout'
      },
      {
        name: 'Priya Menon',
        phone: '9001234570',
        email: 'priya@freshfold.com',
        role: 'qc_specialist',
        performanceScore: 97.0,
        status: 'active',
        assignedArea: 'Main Facility'
      },
      {
        name: 'Deepa Bose',
        phone: '9001234571',
        email: 'deepa@freshfold.com',
        role: 'washer',
        performanceScore: 91.5,
        status: 'active',
        assignedArea: 'Main Facility'
      },
      {
        name: 'Vikram Singh',
        phone: '9001234572',
        email: 'vikram@freshfold.com',
        role: 'washer',
        performanceScore: 87.0,
        status: 'active',
        assignedArea: 'Main Facility'
      }
    ]);
    console.log(`✅ Created ${staff.length} staff members`);

    // Create sample orders
    const orders = await Order.bulkCreate([
      {
        orderId: 'ORD-50001',
        customerId: customers[0].id,
        status: 'Created',
        totalPrice: 250,
        pickupDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        deliveryAddress: customers[0].address,
        specialInstructions: 'Delicate items'
      },
      {
        orderId: 'ORD-50002',
        customerId: customers[1].id,
        status: 'Pending Pickup',
        totalPrice: 450,
        pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        deliveryAddress: customers[1].address,
        specialInstructions: null
      },
      {
        orderId: 'ORD-50003',
        customerId: customers[2].id,
        status: 'Picked Up',
        totalPrice: 150,
        pickupDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        deliveryAddress: customers[2].address,
        specialInstructions: null
      }
    ]);
    console.log(`✅ Created ${orders.length} orders`);

    // Create order items
    const items = await OrderItem.bulkCreate([
      {
        orderId: orders[0].id,
        itemType: 'Shirt',
        quantity: 5,
        weightKg: 2.5,
        serviceType: 'Wash & Fold',
        price: 125
      },
      {
        orderId: orders[0].id,
        itemType: 'Pants',
        quantity: 3,
        weightKg: 1.5,
        serviceType: 'Wash & Fold',
        price: 125
      },
      {
        orderId: orders[1].id,
        itemType: 'Blazer',
        quantity: 2,
        weightKg: null,
        serviceType: 'Dry Cleaning',
        price: 225
      },
      {
        orderId: orders[1].id,
        itemType: 'Dress',
        quantity: 1,
        weightKg: null,
        serviceType: 'Dry Cleaning',
        price: 225
      },
      {
        orderId: orders[2].id,
        itemType: 'Bedsheet',
        quantity: 2,
        weightKg: 3,
        serviceType: 'Wash & Fold',
        price: 75
      },
      {
        orderId: orders[2].id,
        itemType: 'Towel',
        quantity: 4,
        weightKg: 1,
        serviceType: 'Wash & Fold',
        price: 75
      }
    ]);
    console.log(`✅ Created ${items.length} order items`);

    // Create workflow history for first order
    const history = await WorkflowHistory.bulkCreate([
      {
        orderId: orders[0].id,
        eventType: 'order_created',
        statusFrom: null,
        statusTo: 'Created',
        notes: 'Order created successfully',
        timestamp: new Date()
      }
    ]);
    console.log(`✅ Created ${history.length} workflow history entries`);

    // Create staff assignment for second order
    const assignment = await StaffAssignment.create({
      orderId: orders[1].id,
      staffId: staff[0].id, // Ramesh
      taskType: 'pickup',
      status: 'assigned',
      notes: 'Assigned to Ramesh Kumar'
    });
    console.log(`✅ Created staff assignment`);

    // Add workflow history for pending pickup
    await WorkflowHistory.create({
      orderId: orders[1].id,
      eventType: 'status_changed',
      statusFrom: 'Created',
      statusTo: 'Pending Pickup',
      notes: 'Order ready for pickup'
    });

    // Add workflow history for picked up
    await WorkflowHistory.create({
      orderId: orders[2].id,
      eventType: 'staff_assigned',
      statusFrom: null,
      statusTo: 'Pickup Assigned',
      staffId: staff[1].id,
      notes: 'Assigned to Suresh Patel'
    });

    await WorkflowHistory.create({
      orderId: orders[2].id,
      eventType: 'status_changed',
      statusFrom: 'Pending Pickup',
      statusTo: 'Picked Up',
      staffId: staff[1].id,
      notes: 'Order picked up by driver'
    });

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run migration
migrate();
