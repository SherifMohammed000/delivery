**Gho-Va - User Roles, Stories & Acceptance Criteria**

**📋 Understanding Your Business Model First**

Based on your clarification, I need to **redefine the roles** because your model is unique:

**Key Differences from Standard Delivery Apps:**

| **Aspect** | **Standard Model** | **Your Model (Gho-va)** |
| --- | --- | --- |
| **Customer Payment** | Customer pays per order | ❌ Customer pays NOTHING |
| **Revenue Source** | Customer delivery fees | ✅ Delivery guy pays monthly commission |
| **Order Trigger** | Customer requests delivery | Customer requests refill |
| **Payment Flow** | Upfront payment required | No payment at checkout |
| **Business Risk** | Low (pre-paid) | High (delivery guy must trust platform) |

**Your Actual Business Model:**



Customer places order (FREE)

↓

Delivery guy sees order & accepts

↓

Delivery guy refills cylinder at gas station (pays station directly)

↓

Delivery guy delivers to customer

↓

Customer confirms receipt (FREE)

↓

END OF MONTH: Delivery guy pays commission to Gho-va

↓

Gho-va provides access to MORE customers next month

**⚠️ Critical Risk:** If delivery guys don't pay commission, Gho-va loses revenue.

**👥 Recommended 3 Core Roles**

**1\. Customer**

_End user who needs gas refill_

**Operations:**

- Register with phone number and address
- Request gas refill (select size + quantity)
- Track order status
- Confirm receipt when gas arrives
- View order history
- Rate delivery experience

**2\. Delivery Partner (Gas Guy)**

_Independent contractor who fulfills orders_

**Operations:**

- Register and get verified (ID, driver's license, bike details)
- View available orders in their zone
- Accept/decline orders
- Mark order stages: Accepted → At Station → Refilling → En Route → Delivered
- Upload photos (empty cylinder condition, filled cylinder)
- Enter customer OTP for delivery confirmation
- View daily/weekly earnings (orders completed)
- Track monthly commission owed
- Pay commission via Paystack
- View payment history

**3\. Platform Admin**

_Gho-va operations team_

**Operations:**

- Approve/reject delivery partner registrations
- Manage serviceable zones
- Set gas price estimates (displayed to customers)
- View all orders in real-time
- Assign orders manually if needed
- Track delivery partner commission payments
- Generate monthly commission reports
- Handle disputes and complaints
- Broadcast announcements

**📖 User Stories & Acceptance Criteria**

**ROLE 1: CUSTOMER**

**Story C-01: Customer Registration**

_As a customer, I want to register with my phone number so that I can request gas refills._

**Acceptance Criteria:**

- **AC1:** User can register using phone number only (email optional)
- **AC2:** System sends OTP to verify phone number
- **AC3:** User creates a 4-digit PIN for quick logins
- **AC4:** Registration completes in under 2 minutes
- **AC5:** Duplicate phone numbers are rejected with clear message

**Story C-02: Request Gas Refill**

_As a customer, I want to request a gas refill by selecting cylinder size and quantity so that I don't need to call anyone._

**Acceptance Criteria:**

- **AC1:** Customer sees available cylinder sizes (3kg, 6kg, 12kg, 50kg)
- **AC2:** Customer enters quantity (e.g., "Fill 12kg cylinder")
- **AC3:** Customer selects delivery address (saved or new)
- **AC4:** System displays estimated total (gas + delivery fee) - **BUT SHOWS AS "ESTIMATE" not a charge**
- **AC5:** Customer confirms order without entering payment details
- **AC6:** Order receives unique ID (e.g., GH-2026-001234)
- **AC7:** Success message: "Your request has been sent to available delivery partners"

**Important:** Customer never pays. The estimate is just for transparency.

**Story C-03: Track Order Status**

_As a customer, I want to see my order status in real-time so that I know when to expect my gas._

**Acceptance Criteria:**

- **AC1:** Order status shows one of: Pending, Accepted, At Station, Refilling, En Route, Delivered
- **AC2:** Status updates appear automatically without page refresh
- **AC3:** Customer sees delivery partner's name and phone number once accepted
- **AC4:** Estimated arrival time displayed
- **AC5:** Push notification sent on each status change (if customer allows)

**Story C-04: Confirm Delivery with OTP**

_As a customer, I want to confirm that I received my gas so that the delivery partner gets credited._

**Acceptance Criteria:**

- **AC1:** Delivery partner provides 6-digit OTP to customer at delivery
- **AC2:** Customer enters OTP in the app to confirm receipt
- **AC3:** Order status changes to "Completed" after OTP verification
- **AC4:** Customer cannot confirm without receiving gas first
- **AC5:** System logs timestamp of confirmation
- **AC6:** Customer can report issue if OTP doesn't work

**Story C-05: Order History**

_As a customer, I want to view my past orders so that I can reorder easily._

**Acceptance Criteria:**

- **AC1:** Customer sees list of all past orders (last 30 days minimum)
- **AC2:** Each order shows date, size, quantity, delivery partner name
- **AC3:** Customer can tap "Reorder" to duplicate a previous request
- **AC4:** Search and filter by date range
- **AC5:** Customer can rate past deliveries (1-5 stars)

**ROLE 2: DELIVERY PARTNER**

**Story D-01: Partner Registration & Verification**

_As a delivery partner, I want to register and get verified so that I can start accepting orders._

**Acceptance Criteria:**

- **AC1:** Partner provides: Full name, phone number, email, residential address
- **AC2:** Uploads: Government ID, driver's license, bike registration
- **AC3:** Uploads: Bike photo (showing rack/carrier for cylinders)
- **AC4:** Watches mandatory 3-min safety video (cannot skip)
- **AC5:** Takes quiz on safety rules (80% pass required)
- **AC6:** Application status shows: Pending → Under Review → Approved/Rejected
- **AC7:** Admin notified of new registration
- **AC8:** Partner receives SMS/email when approved

**Story D-02: View & Accept Available Orders**

_As a delivery partner, I want to see available orders near me so that I can choose which to accept._

**Acceptance Criteria:**

- **AC1:** Dashboard shows list of pending orders in partner's zone
- **AC2:** Each order shows: Cylinder size, quantity, customer address (distance from partner)
- **AC3:** Partner can refresh list manually
- **AC4:** Partner taps "Accept" to claim an order
- **AC5:** Once accepted, order disappears from other partners' lists
- **AC6:** Partner has 60 seconds to accept before order is offered to others
- **AC7:** Partner cannot accept more than 3 orders simultaneously

**Story D-03: Update Order Status**

_As a delivery partner, I want to update the order status at each stage so that the customer knows progress._

**Acceptance Criteria:**

- **AC1:** Partner can update status to: Accepted → At Station → Refilling → En Route → Delivered
- **AC2:** Each status change requires optional photo upload (except Accepted)
- **AC3:** "At Station" requires partner to select which gas station
- **AC4:** "Refilling" requires photo of cylinder being filled
- **AC5:** "En Route" shows estimated arrival to customer
- **AC6:** Status changes trigger automatic notifications to customer
- **AC7:** Partner cannot skip statuses (must follow sequence)

**Story D-04: Complete Delivery with OTP**

_As a delivery partner, I want the customer to confirm delivery so that I get credit for the order._

**Acceptance Criteria:**

- **AC1:** Upon arrival, partner generates 6-digit OTP in the app
- **AC2:** Partner shows OTP to customer
- **AC3:** Customer enters OTP in their app to confirm
- **AC4:** System verifies OTP and marks order Completed
- **AC5:** Partner cannot mark delivered without OTP
- **AC6:** If customer loses OTP, partner can request new OTP (max 3 attempts)
- **AC7:** Both parties receive completion confirmation

**Story D-05: View Earnings & Commission**

_As a delivery partner, I want to see my earnings and owed commission so that I know what to pay._

**Acceptance Criteria:**

- **AC1:** Dashboard shows:
    - Total orders completed (this month)
    - Total commission owed (e.g., ₦50 per order × 45 orders = ₦2,250)
    - Payment deadline (end of month)
- **AC2:** Partner can view breakdown by date
- **AC3:** System calculates commission based on:
    - Base rate per order (configurable by admin)
    - OR percentage of gas value (configurable)
- **AC4:** Partner sees "Pay Now" button when commission is due
- **AC5:** Payment history shows past payments

**Story D-06: Pay Monthly Commission**

_As a delivery partner, I want to pay my commission via Paystack so that I can continue using the platform._

**Acceptance Criteria:**

- **AC1:** Partner clicks "Pay Commission" button
- **AC2:** System shows amount due and payment period (e.g., March 2026)
- **AC3:** Paystack modal opens with options: Card, Mobile Money, Bank Transfer
- **AC4:** Partner completes payment
- **AC5:** System marks commission as "Paid"
- **AC6:** Partner receives email/SMS receipt
- **AC7:** Admin receives notification of payment
- **AC8:** If payment fails, partner can retry (payment not deducted twice)
- **AC9:** Partner cannot accept new orders if previous month's commission unpaid

**Story D-07: Report Issue with Order**

_As a delivery partner, I want to report problems so that admin can help resolve them._

**Acceptance Criteria:**

- **AC1:** Partner can select an order and tap "Report Issue"
- **AC2:** Issue types: Customer not available, Wrong address, Customer refused delivery, Damaged cylinder
- **AC3:** Partner adds description and optional photo
- **AC4:** Admin receives notification within 5 minutes
- **AC5:** Order status changes to "Disputed"
- **AC6:** Partner can cancel order if issue unresolved after 30 minutes
- **AC7:** Cancelled orders don't count toward commission

**ROLE 3: PLATFORM ADMIN**

**Story A-01: Approve Delivery Partners**

_As an admin, I want to review and approve delivery partners so that only verified professionals join the platform._

**Acceptance Criteria:**

- **AC1:** Admin sees list of pending partner registrations
- **AC2:** Each application shows all uploaded documents
- **AC3:** Admin can click to view ID, license, bike photos
- **AC4:** Admin sees quiz score (must be 80%+)
- **AC5:** Admin clicks Approve or Reject with reason
- **AC6:** System sends automated email/SMS to partner
- **AC7:** Approved partners appear in "Available Partners" list
- **AC8:** Rejected partners can reapply after 30 days
- **AC9:** Admin sees audit log of who approved/rejected

**Story A-02: Manage Serviceable Zones**

_As an admin, I want to define delivery zones so that customers only order from covered areas._

**Acceptance Criteria:**

- **AC1:** Admin can add zones by:
    - Drawing polygon on map (Google Maps integration)
    - OR entering postcodes/landmarks
- **AC2:** Each zone has:
    - Name (e.g., "East Legon")
    - Base delivery fee (e.g., ₦500)
    - Active/inactive toggle
    - Assigned delivery partners
- **AC3:** Customer orders only allowed within active zones
- **AC4:** Admin can edit/delete zones
- **AC5:** Zone changes logged for audit

**Story A-03: View & Manage All Orders**

_As an admin, I want to see all orders in the system so that I can monitor operations._

**Acceptance Criteria:**

- **AC1:** Admin dashboard shows:
    - Total orders today/this week/this month
    - Orders by status (Pending, Accepted, etc.)
    - Orders by zone
    - Average completion time
- **AC2:** Admin can click any order to see full details:
    - Customer info (name, phone, address)
    - Delivery partner assigned
    - Timeline of status changes with timestamps
    - Photos uploaded at each stage
- **AC3:** Admin can search orders by ID, customer phone, partner name
- **AC4:** Admin can filter by date range, status, zone
- **AC5:** Admin can export orders to CSV/Excel

**Story A-04: Manually Assign Orders**

_As an admin, I want to manually assign orders to delivery partners so that no order is left pending._

**Acceptance Criteria:**

- **AC1:** Admin sees list of pending orders (no partner accepted)
- **AC2:** Admin clicks "Assign Manually" on an order
- **AC3:** System shows list of available partners in that zone
- **AC4:** Admin selects partner and confirms assignment
- **AC5:** Partner receives notification of assigned order
- **AC6:** Order status changes to "Accepted"
- **AC7:** Admin cannot assign to partner already busy (max 3 orders)
- **AC8:** Audit log records manual assignment

**Story A-05: Track Commission Payments**

_As an admin, I want to track which delivery partners have paid commission so that I can manage revenue._

**Acceptance Criteria:**

- **AC1:** Admin dashboard shows:
    - Total commission collected this month
    - Partners who have paid vs unpaid
    - Overdue payments (past deadline)
- **AC2:** Admin can click partner to see:
    - Monthly commission breakdown
    - Payment history with receipts
    - Orders that generated commission
- **AC3:** Admin can mark commission as "Paid" manually (for cash payments)
- **AC4:** System automatically updates payment status via Paystack webhook
- **AC5:** Admin can generate commission report by month/partner
- **AC6:** Admin can send payment reminders to unpaid partners

**Story A-06: Set Pricing & Commission Rules**

_As an admin, I want to configure gas estimates and commission rates so that the business model is flexible._

**Acceptance Criteria:**

- **AC1:** Admin can set:
    - Base gas price per kg (e.g., ₦800/kg)
    - Delivery fee per zone (e.g., East Legon: ₦500)
    - Commission structure:
        - Option A: Fixed per order (e.g., ₦50/order)
        - Option B: Percentage of gas value (e.g., 5%)
        - Option C: Monthly subscription (e.g., ₦5,000/month)
- **AC2:** Changes take effect immediately for new orders
- **AC3:** Admin sees preview of how change affects estimates
- **AC4:** All changes logged with timestamp and admin name

**Story A-07: Handle Disputes & Issues**

_As an admin, I want to resolve disputes between customers and delivery partners so that trust is maintained._

**Acceptance Criteria:**

- **AC1:** Admin sees list of disputed orders
- **AC2:** For each dispute, admin sees:
    - Customer complaint
    - Partner report
    - Timeline of events
    - Photos uploaded
- **AC3:** Admin can:
    - Cancel order (no commission charged)
    - Mark as completed (commission charged)
    - Partially refund customer (if applicable - but customers pay nothing in your model)
    - Suspend partner temporarily
- **AC4:** Admin adds resolution notes
- **AC5:** Both parties receive notification of resolution
- **AC6:** Dispute status changes to "Resolved"

**Story A-08: Broadcast Announcements**

_As an admin, I want to send messages to all users or specific groups so that I can communicate important updates._

**Acceptance Criteria:**

- **AC1:** Admin can compose message with title and body
- **AC2:** Admin selects recipients:
    - All customers
    - All delivery partners
    - Specific zone
    - Specific partner
- **AC3:** Admin can schedule message for future date/time
- **AC4:** System sends via:
    - In-app notification
    - SMS (for critical updates)
    - Email (optional)
- **AC5:** Admin sees delivery status (sent/failed)
- **AC6:** Broadcasts logged for audit

**Story A-09: View Analytics Dashboard**

_As an admin, I want to see key metrics so that I can make data-driven decisions._

**Acceptance Criteria:**

- **AC1:** Dashboard shows:
    - **Growth:** New customers (daily/weekly/monthly)
    - **Orders:** Total orders, completed %, avg completion time
    - **Revenue:** Commission collected, projected for month
    - **Partners:** Active partners, avg orders per partner
    - **Zones:** Busiest zones, slowest zones
- **AC2:** All charts are interactive (click to drill down)
- **AC3:** Admin can filter by date range (presets: Today, This Week, This Month, Custom)
- **AC4:** Data refreshes automatically every 5 minutes
- **AC5:** Admin can export dashboard as PDF report

**🔐 Permission Matrix Summary**

| **Feature** | **Customer** | **Delivery Partner** | **Admin** |
| --- | --- | --- | --- |
| Register Account | ✅   | ✅   | ❌   |
| Request Gas Refill | ✅   | ❌   | ❌   |
| Track Orders | ✅ (own) | ✅ (assigned) | ✅ (all) |
| Confirm Delivery (OTP) | ✅   | ⚠️ (generates) | ❌   |
| View Order History | ✅ (own) | ✅ (completed) | ✅ (all) |
| Accept/Decline Orders | ❌   | ✅   | ❌   |
| Update Order Status | ❌   | ✅   | ⚠️ (override) |
| View Earnings | ❌   | ✅   | ✅ (all partners) |
| Pay Commission | ❌   | ✅   | ⚠️ (manual mark) |
| Approve Partners | ❌   | ❌   | ✅   |
| Manage Zones | ❌   | ❌   | ✅   |
| Set Pricing | ❌   | ❌   | ✅   |
| Handle Disputes | ❌   | ❌   | ✅   |
| View Analytics | ❌   | ❌   | ✅   |
| Send Broadcasts | ❌   | ❌   | ✅   |

**Legend:** ✅ Full Access | ⚠️ Limited Access | ❌ No Access

**⚠️ Critical Business Logic to Implement**

**1\. Commission Calculation**

```

// At end of each order completion

commissionEarned = calculateCommission(order)

\- If fixed: ₦50 per order

\- If percentage: gasValue × 5%

\- If subscription: not per order

// Add to partner's monthly balance

partner.monthlyCommission += commissionEarned

// Check if partner can accept new orders

if (partner.hasUnpaidCommission && currentDate > paymentDeadline) {

partner.canAcceptOrders = false

}
```
**2\. OTP Verification Flow**
```

// Delivery partner generates OTP

const otp = generate6DigitOTP()

storeOTP(orderId, otp, expiresIn = 10 minutes)

// Customer enters OTP

if (enteredOTP === storedOTP && !isExpired) {

order.status = 'COMPLETED'

partner.ordersCompleted += 1

calculateCommission(order)

} else {

showError('Invalid or expired OTP')

}

**3\. Commission Payment Deadline**

javascript

Copy

Download

// First of every month

if (currentDate === firstDayOfMonth) {

// Check previous month unpaid commissions

unpaidPartners = getPartnersWithUnpaidCommission(previousMonth)

// Block new orders

unpaidPartners.forEach(partner => {

partner.canAcceptOrders = false

sendNotification('Pay your commission to continue accepting orders')

})

}```