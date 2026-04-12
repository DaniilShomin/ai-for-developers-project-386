import random
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import Owner, EventType, Booker, Booking


def generate_random_name():
    """Генерирует случайное имя."""
    first_names = [
        "Александр",
        "Мария",
        "Дмитрий",
        "Анна",
        "Сергей",
        "Елена",
        "Андрей",
        "Ольга",
        "Максим",
        "Татьяна",
        "Иван",
        "Наталья",
    ]
    last_names = [
        "Иванов",
        "Петров",
        "Сидоров",
        "Козлова",
        "Смирнов",
        "Васильева",
        "Попов",
        "Соколова",
        "Михайлов",
        "Новикова",
        "Федоров",
        "Морозова",
    ]
    return f"{random.choice(first_names)} {random.choice(last_names)}"


def generate_random_email(name: str) -> str:
    """Генерирует email на основе имени."""
    domains = ["example.com", "test.com", "demo.ru", "mail.ru", "gmail.com"]
    # Транслитерация и форматирование
    name_parts = name.lower().split()
    if len(name_parts) >= 2:
        login = f"{name_parts[0]}.{name_parts[1]}"
    else:
        login = name_parts[0]
    # Замена кириллицы на латиницу (упрощённо)
    translit_map = {
        "а": "a",
        "б": "b",
        "в": "v",
        "г": "g",
        "д": "d",
        "е": "e",
        "ё": "e",
        "ж": "zh",
        "з": "z",
        "и": "i",
        "й": "y",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ф": "f",
        "х": "h",
        "ц": "ts",
        "ч": "ch",
        "ш": "sh",
        "щ": "sch",
        "ъ": "",
        "ы": "y",
        "ь": "",
        "э": "e",
        "ю": "yu",
        "я": "ya",
    }
    login_lat = "".join(translit_map.get(c, c) for c in login)
    return f"{login_lat}@{random.choice(domains)}"


def seed_data():
    """Заполняет базу тестовыми данными при первом запуске."""
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже данные
        existing_owner = db.query(Owner).first()
        if existing_owner:
            print("База данных уже содержит данные, пропускаем сидинг.")
            return

        print("Заполнение базы тестовыми данными...")

        # Создаем владельца
        owner_name = generate_random_name()
        owner = Owner(
            name=owner_name,
            email=generate_random_email(owner_name),
            timezone="Europe/Moscow",
            work_start="09:00",
            work_end="18:00",
        )
        db.add(owner)
        db.flush()  # Получаем id до коммита

        # Создаем типы событий
        event_type_1 = EventType(
            title="Консультация 30 минут",
            description="Краткая консультация по любым вопросам",
            duration=30,
            owner_id=owner.id,
        )
        event_type_2 = EventType(
            title="Встреча 1 час",
            description="Полноценная встреча для детального обсуждения",
            duration=60,
            owner_id=owner.id,
        )
        db.add_all([event_type_1, event_type_2])
        db.flush()

        # Создаем клиента (booker)
        booker_name = generate_random_name()
        booker = Booker(
            name=booker_name,
            email=generate_random_email(booker_name),
            phone=f"+7{random.randint(9000000000, 9999999999)}",
        )
        db.add(booker)
        db.flush()

        # Создаем бронирования на ближайшие дни
        tomorrow = datetime.now().replace(
            hour=10, minute=0, second=0, microsecond=0
        ) + timedelta(days=1)
        day_after = tomorrow + timedelta(days=1)

        booking_1 = Booking(
            event_type_id=event_type_1.id,
            owner_id=owner.id,
            booker_id=booker.id,
            start_time=tomorrow,
            end_time=tomorrow + timedelta(minutes=event_type_1.duration),
            notes="Первая тестовая бронь",
            status="confirmed",
        )

        booking_2 = Booking(
            event_type_id=event_type_2.id,
            owner_id=owner.id,
            booker_id=booker.id,
            start_time=day_after,
            end_time=day_after + timedelta(minutes=event_type_2.duration),
            notes="Вторая тестовая бронь",
            status="confirmed",
        )
        db.add_all([booking_1, booking_2])

        db.commit()
        print("Тестовые данные успешно добавлены!")

    except Exception as e:
        db.rollback()
        print(f"Ошибка при заполнении тестовых данных: {e}")
        raise
    finally:
        db.close()
