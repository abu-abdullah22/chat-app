const baseUrl = 'https://frontend-task-chatapp.onrender.com/api';

async function req(method, endpoint, token = null, body = null) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${baseUrl}${endpoint}`, opts);
    let data;
    try {
        data = await res.json();
    } catch {
        data = await res.text();
    }
    console.log(`\n--- ${method} ${endpoint} ---`);
    console.log(`Status: ${res.status}`);
    console.log(JSON.stringify(data, null, 2));
    return { status: res.status, data };
}

async function run() {
    try {
        // 1. Health
        await req('GET', '/health');

        // 2. Login User A, B, C
        const uA = await req('POST', '/auth/login', null, { phone: `+1555000${Math.floor(Math.random()*9000)+1000}`, name: 'Alice' });
        const uB = await req('POST', '/auth/login', null, { phone: `+1555000${Math.floor(Math.random()*9000)+1000}`, name: 'Bob' });
        const uC = await req('POST', '/auth/login', null, { phone: `+1555000${Math.floor(Math.random()*9000)+1000}`, name: 'Charlie' });

        const tokenA = uA.data.token;
        const idB = uB.data.user._id;
        const idC = uC.data.user._id;

        // 3. Me
        await req('GET', '/auth/me', tokenA);

        // 4. Search
        await req('GET', '/users/search?q=Bob', tokenA);

        // 5. Start Direct Conversation
        const directConv = await req('POST', '/conversations', tokenA, { userId: idB });
        const directConvId = directConv.data._id || directConv.data.id || (directConv.data.data && directConv.data.data._id);

        // 6. Create Group
        const groupConv = await req('POST', '/conversations/group', tokenA, {
            name: 'API Test Group',
            participantIds: [idB, idC]
        });
        const groupConvId = groupConv.data._id || groupConv.data.id || (groupConv.data.data && groupConv.data.data._id);

        // 7. List Conversations
        await req('GET', '/conversations', tokenA);

        if (directConvId) {
            // 8. Send Message
            await req('POST', '/messages', tokenA, { conversationId: directConvId, text: 'Hello from Alice to Bob!' });

            // 9. Get Message History
            await req('GET', `/conversations/${directConvId}/messages`, tokenA);
        }

        if (groupConvId) {
            // 10. Remove participant
            await req('DELETE', `/conversations/${groupConvId}/participants/${idC}`, tokenA);

            // 11. Add participant
            await req('POST', `/conversations/${groupConvId}/participants`, tokenA, { userIds: [idC] });

            // 12. Promote admin
            await req('POST', `/conversations/${groupConvId}/admins`, tokenA, { userId: idB });

            // 13. Rename group
            await req('PATCH', `/conversations/${groupConvId}`, tokenA, { name: 'Renamed API Test Group' });
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
