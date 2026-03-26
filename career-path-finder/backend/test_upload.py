import httpx
import asyncio

async def test_upload():
    async with httpx.AsyncClient() as client:
        with open('/Users/deepaparanjpe/Downloads/Deepa_Fractional_CTO_OnePager.pdf', 'rb') as f:
            files = {'resume': ('Deepa_Fractional_CTO_OnePager.pdf', f, 'application/pdf')}
            data = {
                'name': 'Deepa P',
                'headline': 'Fractional CTO',
                'github_url': '',
                'hackerrank_url': '',
                'linkedin_url': '',
                'education': ''
            }
            response = await client.post('http://localhost:8000/api/build', data=data, files=files)
            print("Status:", response.status_code)
            print("Response:", response.json())

if __name__ == "__main__":
    asyncio.run(test_upload())
