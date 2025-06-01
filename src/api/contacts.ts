export async function fetchContacts() {
  try {
    console.log('Начинаем загрузку контактов...');
    const response = await fetch('./assets/contacts_and_groups_converted.json');
    console.log('Статус ответа:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.status}`);
    }
    const data = await response.json();
    console.log('Структура загруженных данных:', {
      isArray: Array.isArray(data),
      length: data.length,
      firstItem: data[0],
      hasPhones: data[0]?.phones,
      hasChildren: data[0]?.children
    });
    return data;
  } catch (error) {
    console.error('Error loading contacts:', error);
    return [];
  }
}

