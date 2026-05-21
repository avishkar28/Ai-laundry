const { Staff, StaffAssignment } = require('../models');
const { sequelize } = require('../config');

// Get staff by role
async function getStaffByRole(role, status = 'active') {
  try {
    return await Staff.findAll({
      where: { role, status },
      order: [['performanceScore', 'DESC']]
    });
  } catch (error) {
    throw new Error(`Failed to get staff: ${error.message}`);
  }
}

// Get staff workload
async function getStaffWorkload(staffId) {
  try {
    const staff = await Staff.findByPk(staffId, {
      include: [{
        association: 'assignments',
        attributes: ['id', 'taskType', 'status', 'orderId', 'assignedAt'],
        where: { status: { $in: ['assigned', 'in_progress'] } }
      }]
    });

    if (!staff) return null;

    const pendingCount = staff.assignments.filter(a => a.status === 'assigned').length;
    const inProgressCount = staff.assignments.filter(a => a.status === 'in_progress').length;

    return {
      staff,
      pendingTasks: pendingCount,
      inProgressTasks: inProgressCount,
      totalActive: pendingCount + inProgressCount
    };
  } catch (error) {
    throw new Error(`Failed to get staff workload: ${error.message}`);
  }
}

// Update staff performance score
async function updateStaffPerformance(staffId, performanceScore) {
  try {
    const staff = await Staff.findByPk(staffId);
    if (!staff) return { success: false, error: 'Staff member not found' };

    await staff.update({ performanceScore });

    return { success: true, staff, message: 'Performance score updated' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all staff
async function getAllStaff(filters = {}) {
  try {
    const where = {};
    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;

    return await Staff.findAll({
      where,
      order: [['performanceScore', 'DESC']]
    });
  } catch (error) {
    throw new Error(`Failed to get staff: ${error.message}`);
  }
}

module.exports = {
  getStaffByRole,
  getStaffWorkload,
  updateStaffPerformance,
  getAllStaff
};
