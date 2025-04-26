document.addEventListener('DOMContentLoaded', function() {
    // Elementos do modal
    const modal = document.getElementById('agendamento-modal');
    const openModalBtn = document.getElementById('open-booking-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const bookingForm = document.getElementById('agendamento-form');
    
    // Funções de controle do modal
    function openModal() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Setar data mínima como hoje
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('agendamento-data').min = today;
        
        // Gerar horários ao abrir o modal
        generateAvailableTimes();
    }
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Event listeners
    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    // Controle de horários ocupados
    function getBookings() {
        return JSON.parse(localStorage.getItem('excellentBookings') || '[]');
    }
    
    function saveBooking(booking) {
        const bookings = getBookings();
        bookings.push(booking);
        localStorage.setItem('excellentBookings', JSON.stringify(bookings));
    }
    
    function checkBookedTimes(selectedDate) {
        const bookings = getBookings();
        const dateBookings = bookings.filter(b => b.data === selectedDate);
        const timeSelect = document.getElementById('agendamento-horario');
        
        Array.from(timeSelect.options).forEach(option => {
            if (option.value) {
                const isBooked = dateBookings.some(b => b.horario === option.value);
                option.disabled = isBooked;
                option.style.color = isBooked ? '#ff6b6b' : '';
            }
        });
    }
    
    function generateAvailableTimes() {
        const select = document.getElementById('agendamento-horario');
        const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00' ];
        
        // Limpar opções existentes (exceto a primeira)
        while (select.options.length > 1) select.remove(1);
        
        // Adicionar horários
        times.forEach(time => {
            const option = new Option(time, time);
            select.add(option);
        });
        
        // Verificar horários ocupados se já tiver data selecionada
        const selectedDate = document.getElementById('agendamento-data').value;
        if (selectedDate) checkBookedTimes(selectedDate);
    }
    
    // Event listeners do formulário
    document.getElementById('agendamento-data').addEventListener('change', function() {
        checkBookedTimes(this.value);
    });
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            nome: document.getElementById('agendamento-nome').value.trim(),
            whatsapp: document.getElementById('agendamento-whatsapp').value.trim(),
            data: document.getElementById('agendamento-data').value,
            horario: document.getElementById('agendamento-horario').value,
            barbeiro: document.querySelector('input[name="barbeiro"]:checked').value,
            timestamp: new Date().toISOString()
        };
        
        // Validar WhatsApp
        if (!/^(\d{10,11})$/.test(formData.whatsapp.replace(/\D/g, ''))) {
            alert('Por favor, insira um WhatsApp válido com DDD');
            return;
        }
        
        // Salvar agendamento localmente
        saveBooking(formData);
        
        // Enviar para WhatsApp
        const whatsappNumber = "554791447298";
        const formattedDate = new Date(formData.data).toLocaleDateString('pt-BR');
        const message = `✂️ *NOVO AGENDAMENTO - EXCELLENT BARBEARIA* ✂️\n\n` +
                       `👤 *Cliente:* ${formData.nome}\n` +
                       `📱 *WhatsApp:* ${formData.whatsapp}\n` +
                       `🗓️ *Data:* ${formattedDate}\n` +
                       `⏰ *Horário:* ${formData.horario}\n` +
                       `💈 *Barbeiro:* ${formData.barbeiro}\n\n` +
                        `_Agendamento realizado via site_`;
        
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        // Abrir WhatsApp e fechar modal
        window.open(whatsappUrl, '_blank');
        alert('Agendamento realizado! Entraremos em contato para confirmação.');
        bookingForm.reset();
        closeModal();
    });
    
    // Inicialização
    generateAvailableTimes();
});