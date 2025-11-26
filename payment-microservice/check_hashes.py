import hashlib

def hash_pan(pan):
    """Crear hash seguro del PAN"""
    return hashlib.sha256(pan.encode()).hexdigest()

# Tarjetas de prueba
cards = [
    {'pan': '4111111111111111', 'name': 'JUAN PEREZ'},
    {'pan': '5555555555554444', 'name': 'MARIA GARCIA'},
    {'pan': '4000000000000002', 'name': 'CARLOS RODRIGUEZ'},
    {'pan': '4000000000000069', 'name': 'ANA MARTINEZ'}
]

print("🔐 Hashes correctos para las tarjetas de prueba:")
print("=" * 80)

for card in cards:
    hash_value = hash_pan(card['pan'])
    print(f"{card['name']}: {card['pan']}")
    print(f"Hash: {hash_value}")
    print(f"Last4: {card['pan'][-4:]}")
    print("-" * 80)