document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('agendamento-modal');
    const openModalBtn = document.getElementById('open-booking-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const bookingForm = document.getElementById('agendamento-form');
    const dataInput = document.getElementById('agendamento-data');

    function openModal() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const today = new Date();
        dataInput.min = today.toISOString().split('T')[0];

        generateAvailableTimes();
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });

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
        const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

        while (select.options.length > 1) select.remove(1);

        times.forEach(time => {
            const option = new Option(time, time);
            select.add(option);
        });

        if (dataInput.value) checkBookedTimes(dataInput.value);
    }

    function isSunday(dateString) {
        const date = new Date(dateString + 'T12:00:00'); // Garantir horário local
        return date.getDay() === 0;
    }

    dataInput.addEventListener('change', function() {
        if (!this.value) return;
        
        if (isSunday(this.value)) {
            alert('A barbearia não abre aos domingos. Por favor, escolha outro dia.');
            this.value = '';
            return;
        }

        checkBookedTimes(this.value);
    });

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!dataInput.value) {
            alert('Por favor, selecione uma data válida.');
            return;
        }

        if (isSunday(dataInput.value)) {
            alert('Não é possível agendar para domingo. Escolha outro dia.');
            return;
        }

        const nome = document.getElementById('agendamento-nome').value.trim();
        const whatsapp = document.getElementById('agendamento-whatsapp').value.trim();
        const data = dataInput.value;
        const horario = document.getElementById('agendamento-horario').value;
        const barbeiro = document.querySelector('input[name="barbeiro"]:checked')?.value || 'Não especificado';
        const timestamp = new Date().toISOString();

        if (!/^(\d{10,11})$/.test(whatsapp.replace(/\D/g, ''))) {
            alert('Por favor, insira um WhatsApp válido com DDD.');
            return;
        }

        const formData = { nome, whatsapp, data, horario, barbeiro, timestamp };
        saveBooking(formData);

        const whatsappNumber = "554791447298";
        const formattedDate = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR');

        const mensagem =
`*NOVO AGENDAMENTO - EXCELLENT BARBEARIA*

👤 *Cliente:* ${nome}
📱 *WhatsApp:* ${whatsapp}
🗓️ *Data:* ${formattedDate}
⏰ *Horário:* ${horario}
💈 *Barbeiro:* ${barbeiro}

_Agendamento realizado via site_`;

        const urlEncodedMessage = encodeURIComponent(mensagem);

        // 👉 Agora usando web.whatsapp.com para forçar o carregamento correto
        const linkWhatsApp = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${urlEncodedMessage}`;

        alert('Clique em "Enviar" no WhatsApp para confirmar seu agendamento.');
        window.open(linkWhatsApp, '_blank');

        bookingForm.reset();
        closeModal();
    });

    generateAvailableTimes();
});
