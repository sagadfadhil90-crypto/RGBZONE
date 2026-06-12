import telebot
import re
import threading

# 1. توكن بوت الزبائن الرسمي (شغال 100% بالخلفية)
CUSTOMER_BOT_TOKEN = "8786196197:AAGm2zy8JuWueIEufH0ot74056oWTih2qu0"
customer_bot = telebot.TeleBot(CUSTOMER_BOT_TOKEN)

# 2. ⚠️ ضع هنا التوكن الحقيقي لبوت الأدمن الجديد اللي سويته من BotFather
# (احذف النص العربي وخلي التوكن مالتك بين القوسين ليروح إيرور 401)
ADMIN_BOT_TOKEN = "8913347086:AAGnw8BgNJ_YSYRmLicqgfDSRkHZu2vlGrA"
admin_bot = telebot.TeleBot(ADMIN_BOT_TOKEN)

# ذاكرة السيرفر المؤقتة (منعاً لإيرورات صلاحية النظام)
latest_customers = {}

print("🚨 سيرفر RGB ZONE المشترك مستقر وآمن 100%...")
print("🤖 بوت الزبون مستعد لاستقبال العملاء...")
print("🛠️ بوت الأدمن مستعد لمعالجة فواتيرك الاحترافية...")

# --- أ. استقبال تفعيل التتبع من الزبون ---
@customer_bot.message_handler(commands=['start'])
def welcome_user(message):
    chat_id = message.chat.id
    username = message.from_user.first_name
    
    # حفظ ذكي بالذاكرة المؤقتة لاسم العميل الأول
    latest_customers[username] = chat_id
    
    welcome_text = (
        f"أهلاً بك عزيزي العميل {username} في سيرفر RGB ZONE لعتاد الجيمنج الاحترافي! 🕹️\n\n"
        "تم تفعيل نظام التتبع التلقائي لطلبيتك بنجاح.\n"
        "فور قيام الإدارة بتحديث حالة طلبك، سيصلك إشعار تفصيلي هنا مباشرةً! غراضك بأيد أمينة وبطلة. 🔥"
    )
    customer_bot.send_message(chat_id, welcome_text)

# --- ب. معالجة زر الأدمن التفاعلي ديناميكياً ---
@admin_bot.callback_query_handler(func=lambda call: call.data.startswith('status_1_'))
def handle_order_status(call):
    try:
        invoice_num = call.data.replace('status_1_', '')
        message_text = call.message.text
        
        # سحب اسم العميل بشكل ديناميكي من الفاتورة لتجاوز الاسم الثابت
        match_name = re.search(r"👤 اسم الزبون:\s*(.+)", message_text)
        
        if match_name:
            full_name = match_name.group(1).strip()
            first_name_only = full_name.split()[0]
        else:
            admin_bot.answer_callback_query(call.id, "❌ لم يتم العثور على اسم الزبون بالرسالة!")
            return

        customer_chat_id = latest_customers.get(first_name_only)
        
        client_msg = (
            f"أهلاً بك عزيزي العميل {full_name}! 🔥\n\n"
            f"يسعدنا إعلامك بأن طلبيتك الخاصة بالعتاد ذي الرقم (#RGB-{invoice_num}) "
            f"قد تم تجهيزها بالكامل وهي الآن بصحبة المندوب وفي الطريق إليك! 🚖\n\n"
            f"يرجى إبقاء خط الهاتف مفتوحاً ومستعداً للرد على اتصال المندوب فور وصوله لتسليمك العتاد الجديد. عيش المتعة واكتسح السيرفر! 🕹️⚡"
        )
        
        if customer_chat_id:
            customer_bot.send_message(customer_chat_id, client_msg)
            admin_bot.answer_callback_query(call.id, f"✅ تم إشعار {first_name_only} بنجاح!")
            
            admin_bot.edit_message_text(
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                text=message_text + f"\n\n🟢 تحديث الأدمن: تم إرسال الإشعار بنجاح، والمندوب بالطريق حالياً!"
            )
        else:
            admin_bot.answer_callback_query(call.id, "❌ الزبون لم يفعل البوت بعد!")
            admin_bot.send_message(call.message.chat.id, f"⚠️ تنبيه للأدمن: الزبون ({full_name}) لم يضغط على Start في بوت الزبائن لتفعيل التتبع حتى الآن.")
            
    except Exception as e:
        print(f"حدث خطأ في معالجة الزر: {e}")
        admin_bot.answer_callback_query(call.id, "❌ حدث خطأ داخلي.")

def run_customer_bot():
    customer_bot.infinity_polling(none_stop=True)

def run_admin_bot():
    admin_bot.infinity_polling(none_stop=True)

if __name__ == "__main__":
    t1 = threading.Thread(target=run_customer_bot)
    t2 = threading.Thread(target=run_admin_bot)
    t1.start()
    t2.start()