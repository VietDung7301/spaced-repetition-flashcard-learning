<template>
    <div class="flex flex-wrap  w-screen justify-center content-center mt-6">
        <form class="w-4/5 mx-auto">
            <div class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <div class="flex flex-row">
                        <div class="mb-5 mr-5 w-1/3">
                            <label for="kanji" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">漢字</label>
                            <input type="text" id="kanji" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                            focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                            dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="漢字" required />
                        </div>
                        <div class="mr-5 w-1/3">
                            <label for="read" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">読み方</label>
                            <input type="text" id="read" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                            focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                            dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="かんじ" />
                        </div>
                        <div class="mb-5 w-1/3">
                            <label for="meaning" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">意味</label>
                            <input type="text" id="meaning" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                            focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                            dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                        </div>
                    </div>
                    <div class="flex flex-row">
                        <div class="w-full">
                            <label for="example" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">例</label>
                            <div class="mt-2">
                                <textarea name="example" id="example" rows="2" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"></textarea>
                            </div>
                        </div>
                    </div>
						<div class="flex flex-row-reverse">
								<button type="button" class="mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
														<svg class="w-6 h-6 mr-2 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
															<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 11.917 9.724 16.5 19 7.5"/>
														</svg>
														Save
												</button>
									
								</div>                
            </div>
        </form>
    </div>
</template>