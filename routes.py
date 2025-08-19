from flask import render_template, request, redirect, url_for, flash, session
from flask_login import current_user
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy import extract, func, desc
from app import app, db
from models import Transaction, Category, User
from replit_auth import require_login, make_replit_blueprint

# Register the authentication blueprint
app.register_blueprint(make_replit_blueprint(), url_prefix="/auth")

# Make session permanent
@app.before_request
def make_session_permanent():
    session.permanent = True

# Initialize default categories
def init_default_categories():
    """Initialize default transaction categories if they don't exist"""
    default_categories = [
        # Income categories
        ('Salary', 'income', 'briefcase'),
        ('Freelance', 'income', 'edit-3'),
        ('Investment', 'income', 'trending-up'),
        ('Gift', 'income', 'gift'),
        ('Other Income', 'income', 'plus'),
        
        # Expense categories
        ('Food & Dining', 'expense', 'coffee'),
        ('Transportation', 'expense', 'truck'),
        ('Shopping', 'expense', 'shopping-bag'),
        ('Entertainment', 'expense', 'film'),
        ('Bills & Utilities', 'expense', 'zap'),
        ('Healthcare', 'expense', 'heart'),
        ('Education', 'expense', 'book'),
        ('Travel', 'expense', 'map-pin'),
        ('Other Expense', 'expense', 'minus'),
    ]
    
    for name, category_type, icon in default_categories:
        if not Category.query.filter_by(name=name).first():
            category = Category(
                name=name, 
                category_type=category_type, 
                icon=icon
            )
            db.session.add(category)
    
    db.session.commit()

# Track if categories are initialized
categories_initialized = False

# Initialize categories on first request
@app.before_request
def initialize_app():
    global categories_initialized
    if not categories_initialized:
        init_default_categories()
        categories_initialized = True

@app.route('/')
def index():
    """Landing page for logged out users, dashboard for logged in users"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/dashboard')
@require_login
def dashboard():
    """Main dashboard showing financial overview"""
    user_id = current_user.id
    
    # Get current month data
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    # Calculate totals
    income_total = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == 'income',
        extract('month', Transaction.transaction_date) == current_month,
        extract('year', Transaction.transaction_date) == current_year
    ).scalar() or Decimal('0.00')
    
    expense_total = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == 'expense',
        extract('month', Transaction.transaction_date) == current_month,
        extract('year', Transaction.transaction_date) == current_year
    ).scalar() or Decimal('0.00')
    
    balance = income_total - expense_total
    
    # Get recent transactions
    recent_transactions = Transaction.query.filter_by(user_id=user_id)\
        .order_by(desc(Transaction.transaction_date))\
        .limit(5).all()
    
    # Get expense breakdown by category
    expense_categories = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == 'expense',
        extract('month', Transaction.transaction_date) == current_month,
        extract('year', Transaction.transaction_date) == current_year
    ).group_by(Transaction.category).all()
    
    return render_template('dashboard.html',
                         income_total=float(income_total),
                         expense_total=float(expense_total),
                         balance=float(balance),
                         recent_transactions=recent_transactions,
                         expense_categories=expense_categories,
                         current_month=datetime.now().strftime('%B %Y'))

@app.route('/transactions')
@require_login
def transactions():
    """View all transactions with filtering"""
    user_id = current_user.id
    page = request.args.get('page', 1, type=int)
    category_filter = request.args.get('category', '')
    type_filter = request.args.get('type', '')
    
    query = Transaction.query.filter_by(user_id=user_id)
    
    if category_filter:
        query = query.filter_by(category=category_filter)
    
    if type_filter:
        query = query.filter_by(transaction_type=type_filter)
    
    transactions = query.order_by(desc(Transaction.transaction_date))\
        .paginate(page=page, per_page=20, error_out=False)
    
    # Get all categories for filter dropdown
    categories = Category.query.all()
    
    return render_template('transactions.html',
                         transactions=transactions,
                         categories=categories,
                         category_filter=category_filter,
                         type_filter=type_filter)

@app.route('/add_transaction', methods=['GET', 'POST'])
@require_login
def add_transaction():
    """Add a new transaction"""
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        amount = request.form.get('amount', '').strip()
        transaction_type = request.form.get('transaction_type', '').strip()
        category = request.form.get('category', '').strip()
        description = request.form.get('description', '').strip()
        transaction_date = request.form.get('transaction_date', '').strip()
        
        # Validation
        if not all([title, amount, transaction_type, category]):
            flash('Please fill in all required fields.', 'error')
            return redirect(url_for('add_transaction'))
        
        try:
            amount = Decimal(amount)
            if amount <= 0:
                raise ValueError("Amount must be positive")
        except (ValueError, TypeError):
            flash('Please enter a valid positive amount.', 'error')
            return redirect(url_for('add_transaction'))
        
        try:
            if transaction_date:
                date_obj = datetime.strptime(transaction_date, '%Y-%m-%d').date()
            else:
                date_obj = datetime.now().date()
        except ValueError:
            flash('Please enter a valid date.', 'error')
            return redirect(url_for('add_transaction'))
        
        # Create transaction
        transaction = Transaction(
            user_id=current_user.id,
            title=title,
            amount=amount,
            transaction_type=transaction_type,
            category=category,
            description=description,
            transaction_date=date_obj
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        flash('Transaction added successfully!', 'success')
        return redirect(url_for('transactions'))
    
    # GET request - show form
    categories = Category.query.all()
    return render_template('add_transaction.html', categories=categories)

@app.route('/edit_transaction/<int:transaction_id>', methods=['GET', 'POST'])
@require_login
def edit_transaction(transaction_id):
    """Edit an existing transaction"""
    transaction = Transaction.query.filter_by(
        id=transaction_id, 
        user_id=current_user.id
    ).first_or_404()
    
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        amount = request.form.get('amount', '').strip()
        transaction_type = request.form.get('transaction_type', '').strip()
        category = request.form.get('category', '').strip()
        description = request.form.get('description', '').strip()
        transaction_date = request.form.get('transaction_date', '').strip()
        
        # Validation
        if not all([title, amount, transaction_type, category]):
            flash('Please fill in all required fields.', 'error')
            return redirect(url_for('edit_transaction', transaction_id=transaction_id))
        
        try:
            amount = Decimal(amount)
            if amount <= 0:
                raise ValueError("Amount must be positive")
        except (ValueError, TypeError):
            flash('Please enter a valid positive amount.', 'error')
            return redirect(url_for('edit_transaction', transaction_id=transaction_id))
        
        try:
            if transaction_date:
                date_obj = datetime.strptime(transaction_date, '%Y-%m-%d').date()
            else:
                date_obj = datetime.now().date()
        except ValueError:
            flash('Please enter a valid date.', 'error')
            return redirect(url_for('edit_transaction', transaction_id=transaction_id))
        
        # Update transaction
        transaction.title = title
        transaction.amount = amount
        transaction.transaction_type = transaction_type
        transaction.category = category
        transaction.description = description
        transaction.transaction_date = date_obj
        
        db.session.commit()
        
        flash('Transaction updated successfully!', 'success')
        return redirect(url_for('transactions'))
    
    # GET request - show form
    categories = Category.query.all()
    return render_template('edit_transaction.html', 
                         transaction=transaction, 
                         categories=categories)

@app.route('/delete_transaction/<int:transaction_id>')
@require_login
def delete_transaction(transaction_id):
    """Delete a transaction"""
    transaction = Transaction.query.filter_by(
        id=transaction_id, 
        user_id=current_user.id
    ).first_or_404()
    
    db.session.delete(transaction)
    db.session.commit()
    
    flash('Transaction deleted successfully!', 'success')
    return redirect(url_for('transactions'))

@app.route('/reports')
@require_login
def reports():
    """Financial reports and charts"""
    user_id = current_user.id
    
    # Get monthly data for the last 12 months
    monthly_data = []
    for i in range(11, -1, -1):
        date = datetime.now() - timedelta(days=30 * i)
        month = date.month
        year = date.year
        
        income = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == 'income',
            extract('month', Transaction.transaction_date) == month,
            extract('year', Transaction.transaction_date) == year
        ).scalar() or Decimal('0.00')
        
        expense = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == 'expense',
            extract('month', Transaction.transaction_date) == month,
            extract('year', Transaction.transaction_date) == year
        ).scalar() or Decimal('0.00')
        
        monthly_data.append({
            'month': date.strftime('%b %Y'),
            'income': float(income),
            'expense': float(expense),
            'balance': float(income - expense)
        })
    
    # Get category breakdown for current year
    current_year = datetime.now().year
    
    income_categories = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == 'income',
        extract('year', Transaction.transaction_date) == current_year
    ).group_by(Transaction.category).all()
    
    expense_categories = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == 'expense',
        extract('year', Transaction.transaction_date) == current_year
    ).group_by(Transaction.category).all()
    
    return render_template('reports.html',
                         monthly_data=monthly_data,
                         income_categories=income_categories,
                         expense_categories=expense_categories,
                         current_year=current_year)
