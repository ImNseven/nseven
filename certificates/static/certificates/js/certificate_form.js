
function initializeCertificateForm() {
    console.log('Certificate form initialized');
}

function addAuditorForm() {
    const formset = document.getElementById('auditor-forms');
    const totalForms = document.querySelector('input[name$="-TOTAL_FORMS"]');
    const formCount = parseInt(totalForms.value);
    
    // Клонируем последнюю форму
    const lastForm = formset.lastElementChild;
    const newForm = lastForm.cloneNode(true);
    
    // Обновляем индексы в новой форме
    const formRegex = new RegExp(`auditors-(\d+)-`, 'g');
    newForm.innerHTML = newForm.innerHTML.replace(formRegex, `auditors-${formCount}-`);
    
    // Очищаем значения полей
    const inputs = newForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type !== 'hidden') {
            input.value = '';
        }
        input.removeAttribute('checked');
        input.removeAttribute('selected');
    });
    
    // Удаляем информацию о текущих файлах
    const currentFileInfo = newForm.querySelectorAll('p');
    currentFileInfo.forEach(p => {
        if (p.textContent.includes('Текущий файл:')) {
            p.remove();
        }
    });
    
    // Удаляем превью изображений
    const previews = newForm.querySelectorAll('.preview-image');
    previews.forEach(preview => preview.remove());
    
    // Добавляем новую форму
    formset.appendChild(newForm);
    
    // Обновляем счетчик форм
    totalForms.value = formCount + 1;
    
    console.log('New auditor form added');
}

function savePsdFile(fileType, auditorId) {
    if (!auditorId) {
        alert('Сначала сохраните аудитора');
        return;
    }
    
    // Отправляем AJAX запрос для генерации PSD файла
    fetch(`/admin/generate-psd/${auditorId}/${fileType}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Ошибка при генерации PSD файла');
    })
    .then(blob => {
        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${fileType}_${auditorId}.psd`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('PSD file saved successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка при сохранении PSD файла: ' + error.message);
    });
}

// Функция для предпросмотра изображений
function showImagePreview(imageSrc) {
    // Создаем модальное окно для предпросмотра, если его нет
    let modal = document.getElementById('imagePreviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'imagePreviewModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Предпросмотр изображения</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img id="previewImage" src="" class="img-fluid" alt="Предпросмотр">
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('previewImage').src = imageSrc;
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Функция для удаления файлов
function deleteFile(fileField, element) {
    if (confirm('Вы уверены, что хотите удалить этот файл?')) {
        const clearInput = document.querySelector(`input[name="clear_${fileField}"]`);
        if (clearInput) {
            clearInput.checked = true;
        }
        
        // Скрываем превью и кнопку удаления
        const cardBody = element.closest('.card-body');
        const img = cardBody.querySelector('img');
        if (img) img.style.display = 'none';
        element.style.display = 'none';
        
        console.log(`File ${fileField} marked for deletion`);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики событий для существующих элементов
    document.querySelectorAll('.preview-image').forEach(img => {
        img.addEventListener('click', function() {
            showImagePreview(this.src);
        });
    });
    
    document.querySelectorAll('.delete-file').forEach(btn => {
        btn.addEventListener('click', function() {
            const fileField = this.dataset.fileField;
            deleteFile(fileField, this);
        });
    });
    
    document.querySelectorAll('.save-psd').forEach(btn => {
        btn.addEventListener('click', function() {
            const fileType = this.dataset.fileType;
            const auditorId = this.dataset.auditorId;
            savePsdFile(fileType, auditorId);
        });
    });
    
    const addAuditorBtn = document.getElementById('add-auditor');
    if (addAuditorBtn) {
        addAuditorBtn.addEventListener('click', addAuditorForm);
    }
});