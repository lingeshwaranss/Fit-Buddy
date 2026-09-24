def calculate_macronutrients(weight_kg: float, goal: str):
    """
    Optional helper to calculate baseline daily macros based on user weight and fitness goal.
    """
    lower = goal.lower()
    if "muscle" in lower or "gain" in lower:
        protein_g = round(weight_kg * 2.0)
        fat_g = round(weight_kg * 0.9)
        calories = round(weight_kg * 35)
    elif "loss" in lower or "fat" in lower:
        protein_g = round(weight_kg * 1.8)
        fat_g = round(weight_kg * 0.7)
        calories = round(weight_kg * 26)
    else:
        protein_g = round(weight_kg * 1.4)
        fat_g = round(weight_kg * 0.8)
        calories = round(weight_kg * 30)

    carb_cals = max(0, calories - (protein_g * 4 + fat_g * 9))
    carbs_g = round(carb_cals / 4)

    return {
        "calories": calories,
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fat_g": fat_g
    }
